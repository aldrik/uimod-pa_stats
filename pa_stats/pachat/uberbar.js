(function() {
    var modBaseDir = typeof paStatsBaseDir !== "undefined" ? paStatsBaseDir : 'coui://ui/mods/';

    model.maxMessageLogLength = ko.observable(500).extend({
        local : 'info.nanodesu.pachat.max_message_log_length'
    });
    model.ownColor = ko.observable("#ff00cc").extend({
        local : 'info.nanodesu.pachat.color_own'
    });
    model.otherColor = ko.observable("#00FF00").extend({
        local : 'info.nanodesu.pachat.color_other'
    });
    model.modColor = ko.observable("#3399FF").extend({
        local : 'info.nanodesu.pachat.color_mod'
    });
    model.ownerColor = ko.observable("#FF9900").extend({
        local : 'info.nanodesu.pachat.color_owner'
    });
    model.blockedColor = ko.observable("#A0A0A0").extend({
        local : 'info.nanodesu.pachat.color_blocked'
    });
    model.mutedColor = ko.observable("#606060").extend({
        local : 'info.nanodesu.pachat.color_muted'
    });
    model.alignChatLeft = ko.observable().extend({
        local : 'alignChatLeft'
    });

    model.pastatsIds = ko.observable({}).extend({
        local: 'info.nanodesu.pachat.pastatsids'
    });
    
    loadScript("coui://ui/main/shared/js/matchmaking_utility.js");

    ko.bindingHandlers.resizable = {
        init : function(element, valueAccessor) {
            var options = valueAccessor();
            $(element).resizable(options);
        }
    };

    // from uberbar.js with extensions for rank and league

    /*
     * an ubernet user you have encounterd: includes friends, recent contacts, ignored, blocked
     */
    function ExtendedUserViewModel(id) {
        var self = this;

        self.rank = ko.observable(undefined);

        self.league = ko.observable(undefined);
        self.leagueImage = ko.computed(function() {
            return MatchmakingUtility.getSmallBadgeURL(self.league());
        });

        self.hasLeagueImage = ko.computed(function() {
            return self.leagueImage() !== undefined && self.leagueImage() !== "";
        });

        self.uberId = ko.observable(id);
        self.displayName = LeaderboardUtility.getPlayerDisplayName(id);

        self.pendingChat = ko.observable(false);

        self.tags = ko.observable({});
        self.tagList = ko.computed(function() {
            var result = [];

            _.forEach(self.tags(), function(element, key) {
                if (element)
                    result.push(key);
            });

            return result;
        });

        function updateTags() {
            var result = model.userTagMap()[id];
            self.tags(result ? result : {});
        }
        updateTags();

        self.friend = ko.computed(function() {
            return self.tags()['FRIEND']
        });
        self.pendingFriend = ko.computed(function() {
            return self.tags()['PENDING_FRIEND']
        });
        self.allowChat = ko.computed(function() {
            return self.friend() || self.tags()['ALLOW_CHAT']
        });
        self.ignored = ko.computed(function() {
            return self.tags()['IGNORED']
        });
        self.blocked = ko.computed(function() {
            return self.tags()['BLOCKED']
        });
        self.search = ko.computed(function() {
            return self.tags()['SEARCH']
        });

        self.lastInteractionTime = ko.computed(function() {
            return model.idToInteractionTimeMap()[self.uberId()]
        });

        self.hasName = ko.computed(function() {
            return !!self.displayName();
        });

        self.presenceType = ko.computed(function() {
            if (!model.idToJabberPresenceTypeMap())
                return 'unavailable';
            var result = model.idToJabberPresenceTypeMap()[self.uberId()];
            return result || 'unavailable';
        });
        self.available = ko.computed(function() {
            return self.presenceType() === 'available'
        });
        self.away = ko.computed(function() {
            return self.presenceType() === 'away'
        });
        self.dnd = ko.computed(function() {
            return self.presenceType() === 'dnd'
        });
        self.offline = ko.computed(function() {
            return self.presenceType() === 'unavailable'
        });
        self.status = ko.computed(function() {
            if (!model.idToJabberPresenceStatusMap())
                return '';
            var s = model.idToJabberPresenceStatusMap()[self.uberId()];
            return (s && s !== 'undefined') ? s : '';
        });
        self.online = ko.computed(function() {
            return !self.offline()
        });

        self.startChat = function() {
            console.log('startChat');
            var exists = model.conversationMap()[self.uberId()];
            if (exists)
                exists.minimized(false);
            else
                model.startConversationsWith(self.uberId())
        };
        self.startChatIfOnline = function() {
            console.log('startChatIfOnline');
            if (self.offline())
                return;
            self.startChat()
        }
        self.sendReply = function() {
            var msg = self.reply();

            jabber.sendChat(self.partnerUberId(), msg);
            self.messageLog.push({
                'name' : model.displayName(),
                'message' : msg,
                'parts' : model.splitURLs(msg)
            });
            self.reply('');
        };

        self.sendChatInvite = function() {
            console.log('sendChatInvite');
            self.pendingChat(true);
            self.startChat();

            jabber.sendCommand(self.uberId(), 'chat_invite');
        }

// clicked accept on notification

        self.acceptChatInvite = function() {
            console.log('acceptChatInvite');

            jabber.sendCommand(self.uberId(), 'accept_chat_invite');

            self.addTag('ALLOW_CHAT', function() {
                self.pendingChat(false)
            });
            self.startChat();
        }

// received jabber accept_chat_invite command

        self.acceptChatInviteReceived = function() {
            console.log('acceptChatInviteReceived');

            self.addTag('ALLOW_CHAT', function() {
                self.pendingChat(false)
            });
            self.startChat();
        }

// clicked decline on notification

        self.declineChatInvite = function() {
            console.log('declineChatInvite');
            if (!self.pendingChat())
                jabber.sendCommand(self.uberId(), 'decline_chat_invite');
        }

// received jabber decline_chat_invite command

        self.declineChatInviteReceived = function() {
            console.log('declineChatInviteReceived');
        }

        self.sendFriendRequest = function() {
            console.log('sendFriendRequest');
            if (self.friend())
                return;

            self.addTag('PENDING_FRIEND');
            jabber.sendCommand(self.uberId(), 'friend_request');
        }

// clicked accept on notification

        self.acceptFriendRequest = function() {
            console.log('acceptFriendRequest');

            jabber.sendCommand(self.uberId(), 'accept_friend_request');

            self.addTag('FRIEND', function() {
                self.removeTag('PENDING_FRIEND')
            });
            jabber.addContact(self.uberId());
        }
 
// received accept_friend_request jabber command

         self.acceptFriendRequestReceived = function() {
            console.log('acceptFriendRequestReceived');

            self.addTag('FRIEND', function() {
                self.removeTag('PENDING_FRIEND')
            });
            jabber.addContact(self.uberId());
        }
        
// clicked decline on notification

        self.declineFriendRequest = function() {
            console.log('declineFriendRequest');
            if (!self.pendingFriend())
                jabber.sendCommand(self.uberId(), 'decline_friend_request');

            self.removeTag('PENDING_FRIEND');
        }

// received decline_friend_request jabber command

        self.declineFriendRequestReceived = function() {
            console.log('declineFriendRequestReceived');

            self.removeTag('PENDING_FRIEND');
        }
        
        self.unfriend = function() {
            console.log('unfriend');
            self.removeTag('FRIEND');
            self.removeTag('ALLOW_CHAT');
            jabber.removeContact(self.uberId());
        }
        self.sendUnfriend = function() {
            console.log('sendUnfriend');
            if (!self.friend())
                return;

            self.unfriend();
            jabber.sendCommand(self.uberId(), 'unfriend');
        }

        self.sendInviteToGame = function() {
            console.log('sendInviteToGame');
            jabber.sendCommand(self.uberId(), 'game_invite');

            model.pendingGameInvites()[self.uberId()] = model.lobbyInfo() ? model.lobbyInfo().lobby_id : false;

            if (!model.lobbyInfo())
                api.Panel.message('game', 'create_lobby');
        }

// clicked accept on join game notification

        self.acceptInviteToGame = function() {
            console.log('acceptInviteToGame');
            model.acceptedGameInviteFrom(self.uberId());
            jabber.sendCommand(self.uberId(), 'accept_game_invite');
        }

// clicked decline on join game notification

        self.declineInviteToGame = function() {
            console.log('declineInviteToGame');
            jabber.sendCommand(self.uberId(), 'decline_game_invite');
        }

        self.viewProfile = function() {
        }
        self.report = function() {
            self.block();
        }

        self.remove = function() {
            self.sendUnfriend();
            model.removeAllUserTagsFor(self.uberId());
            updateTags();
            _.defer(model.requestUbernetUsers);
        }

        self.addTag = function(tag, callback) {
            model.addUserTags(self.uberId(), [ tag ]);
            updateTags();
            if (callback)
                callback();
        }

        self.removeTag = function(tag, callback) {
            model.removeUserTags(self.uberId(), [ tag ]);
            updateTags();
            if (callback)
                callback();
        }

        self.block = function() {
            self.addTag('BLOCKED', self.sendUnfriend);
            jabber.removeContact(self.uberId());
        }

        self.unblock = function() {
            self.removeTag('BLOCKED');
        }

    }
    ;

    // end of ExtendedUserViewModel

    // the following from uber.js need to use our ExtendedUserViewModel

    model.addContact = function(ubername, uberid, tags) {
        if (uberid === model.uberId())
            return;

        model.addUserTags(uberid, tags);
        model.users.push(new ExtendedUserViewModel(uberid));
    }

    model.requestUbernetUsers = function() {
        model.maybeConvertFriends();

        var contacts = _.reject(_.keys(model.userTagMap()), function(element) {
            return isNaN(element);
        });
        var results = _.map(contacts, function(element) {
            return new ExtendedUserViewModel(element);
        });

        model.users(results);
    };

    model.maybeCreateNewContactWithId = function(uberid) {
        if (model.idToContactMap()[uberid] || uberid === model.uberId()) {
            model.idToInteractionTimeMap()[uberid] = _.now();
            model.idToInteractionTimeMap(model.idToInteractionTimeMap()); // trigger write to session storage
            return;
        }

        // model.users.push(new UserViewModel({ 'FriendUberId': uberid })); // luckily this will never work in real PA otherwise duplicate users
        model.addContact('', uberid, [ 'CONTACT' ]);
    }

    // room view of ExtendedUserViewModel linked to ExtendedUserViewModel

    function RoomExtendedUserViewModel(realUser, name, uberid, chatHandle, admin, mod, muted, jid, presenceType, presenceStatus, removed) {

        var self = this;

        self.uberId = ko.observable(uberid);

        self.user = realUser;

        self.handle = ko.observable(chatHandle);
        self.jid = ko.observable(jid);
        self.roomName = ko.observable(name);

        self.isModerator = ko.observable(mod);
        self.isAdmin = ko.observable(admin);
        self.isMuted = ko.observable(muted);
        
        self.getPaStatsIdAndOpen = function(pageUrl) {
            var cached = model.pastatsIds()[self.uberId()];
            if (cached === undefined) {
                // this may seem inefficient, but for any player who has pa stats enabled it will only be run once and only when opening the context menu.
                engine.asyncCall('ubernet.call', '/GameClient/UserName?UberId=' + self.uberId(), false).done(function(data) {
                    var result = JSON.parse(data);
                    var pastatsprofilelink = 'http://www.pastats.com/report/getplayerid?ubername=' + result.UberName;
                    $.get(pastatsprofilelink, function(data) {
                        console.log("loaded pa stats id "+ data + " for player " + self.uberId());
                        if (data !== "-1" && data !== -1) {
                            model.pastatsIds()[self.uberId()] = data;
                        }
                        model.openUrl(pageUrl + data); // this opens an empty profile for players who do not have a profile. Not optimal, but should be okay I think.
                    });
                });
            } else {
                console.log("use cached pa stats id "+cached + " for player " + self.uberId());
                model.openUrl(pageUrl + cached);
            }
        };
        
        // these are room level

        self.jabberPresenceType = ko.observable(presenceType);
        self.jabberPresenceStatus = ko.observable(presenceStatus);

        self.available = ko.computed(function() {
            return self.jabberPresenceType() === 'available'
        });
        self.away = ko.computed(function() {
            return self.jabberPresenceType() === 'away'
        });
        self.dnd = ko.computed(function() {
            return self.jabberPresenceType() === 'dnd'
        });
        self.offline = ko.computed(function() {
            return self.jabberPresenceType() === 'unavailable'
        });
        self.online = ko.computed(function() {
            return !self.offline()
        });

        self.friend = ko.computed(function() {
            return self.user.friend();
        });

        self.blocked = ko.computed(function() {
            return self.user.blocked();
        });

        self.allowChat = ko.computed(function() {
            return self.user.allowChat();
        });

        self.isRemoved = ko.observable(removed);

        self.roomColor = ko.computed(function() {
            if (self.isModerator() && !self.isAdmin()) {
                return model.modColor();
            } else if (self.isAdmin()) {
                return model.ownerColor();
            } else if (self.isMuted()) {
                return model.mutedColor();
            } else if (self.blocked()) {
                return model.blockedColor();
            } else {
                return model.otherColor();
            }
        });

        self.chatMessageColor = ko.computed(function() {
            if (!self.blocked() && !self.isMuted() && self.uberId() === model.uberId()) {
                return model.ownColor();
            } else {
                return self.roomColor();
            }
        });

        self.resource = ko.computed(function() {
            // resource is everything after the first /

            var jid = self.jid();

            if (!jid) {
                return '';
            }

            var pos = jid.indexOf('/');

            return pos == -1 ? '' : jid.slice(pos + 1);

        });

        self.roomDisplayName = ko.computed(function() {
            // we start with chat handle until a display name is available

            var chatHandle = self.handle();

            var displayName = chatHandle;

            var uid = self.uberId();

            if (uid) {

                var name = self.user.displayName();

                if (name) {
                    displayName = name;

                    var room = model.chatRoomMap()[self.roomName()];

                    if (displayName && room) {
                        var handles = room.displayNameHandleMap()[displayName];

                        if (!handles) {
                            handles = room.displayNameHandleMap()[displayName] = {};
                        }

                        handles[chatHandle] = uid;
                    }
                }
            }

            return displayName;

        });

        self.displayInfo = ko.computed(function() {
            var league = self.user && self.user.league();

            var leagueName = 'Unranked';

            if (league) {
                leagueName = MatchmakingUtility.getTitle(league);
            }

            var pos = league && leagueName != 'Provisional' ? '#' + (self.user && self.user.rank()) + ' ' : '';

            var name = self.roomDisplayName();

            var resource = self.resource();

            return leagueName + ' ' + pos + name + (resource ? ' (' + resource + ')' : '');
        });

    }

    // end of RoomExtendedUserViewModel

    function ChatRoomModel(roomName) {

        var self = this;

        self.bannedUsers = ko.observable([]);

        self.getIdOfBannedUser = function(bannedUserName) {
            console.log("getIdOfBannedUser with " + bannedUserName);
            var found = self.bannedUsers().filter(function(bannedUser) {
                var user = bannedUser.roomUser;
                return user.displayName() === bannedUserName;
            });
            return found.length > 0 ? found[0].uberId : undefined;
        };

        self.roomName = ko.observable(roomName);

        self.minimized = ko.observable(false);
        self.messages = ko.observableArray([]); // objects like {user, content, time}
        self.sortedMessages = ko.computed(function() {
            return _.sortBy(self.messages(), function(e) {
               return e.time; 
            });
        });
        self.lastMessage = ko.computed(function() {
            return self.sortedMessages()[self.sortedMessages().length - 1];
        });

        self.usersMap = ko.observable({}); // jid > chat room ExtendedUserViewModel
        self.fromJidMap = ko.observable({}); // real time message from > jid
        self.messageJidMap = ko.observable({}); // message jid usage

        self.displayNameHandleMap = ko.observable({});

        self.presentUsers = ko.computed(function() {
            return _.reject(self.usersMap(), function(user) {
                return user.isRemoved();
            });
        });

        self.sortedUsers = ko.computed(function() {
            return self.presentUsers().sort(function(a, b) {
                var aName = a.roomDisplayName();

                if (aName == undefined) {
                    return 1;
                }

                var bName = b.roomDisplayName();

                if (bName == undefined) {
                    return -1;
                }

                var aModerator = a.isModerator();
                var bModerator = b.isModerator();

                if ((aModerator && bModerator) || (!aModerator && !bModerator)) {
                    return aName.localeCompare(bName);
                } else {
                    return (aModerator && !bModerator) ? -1 : 1;
                }
            });
        });

        self.usersCount = ko.computed(function() {
            return self.sortedUsers().length;
        });

        self.selfIsAdmin = function() {
            var r = false;
            _.forEach(self.usersMap(), function(u) {
                if (u.uberId() === model.uberId()) {
                    r = u.isModerator() || u.isAdmin();
                    return true;
                }
            });
            return r;
        };

        self.toggleMinimized = function() {
            self.minimized(!self.minimized());
        };
        self.maximize = function() {
            self.minimized(false);
        };
        self.minimized.subscribe(function(value) {
            if (!value) {
                self.dirty(false);
            }
            self.scrollDown();
        });

        self.scrollDown = function() {
            _.defer(function() {
                $chat = $('#chat-' + self.roomName());

                if ($chat.length > 0) {
                    $chat.scrollTop($chat[0].scrollHeight);
                }
            });
        };

        model.splitURLs = function(message) {
            var parts = [];

            _.forEach(message.split(/(\bhttps?:\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig), function(part) {
                if (part.trim()) {
                    parts.push({
                        text : part,
                        link : part.slice(0, 4) == 'http'
                    });
                }
            });

            return parts;
        }

        model.openUrl = function(href) {
            engine.call('web.launchPage', href);
        }

        model.messageLinkClick = function() {
            var part = this;
            model.openUrl(part.text);
        }

        self.addMessage = function(message) {
            message.mentionsMe = message.roomUser && message.content
                    && message.content.toLowerCase().indexOf(model.displayName().toLowerCase()) !== -1
                    && model.uberId() !== message.roomUser.uberId();
            message.parts = model.splitURLs(message.content);
            self.messages.push(message);

            if (self.messages().length > model.maxMessageLogLength()) {
                self.messages.splice(0, 1);
            }

            self.dirty(self.minimized());
            self.dirtyMention(self.minimized() && message.mentionsMe);
        };

        self.dirty = ko.observable(false);
        self.dirtyMention = ko.observable(false);
        self.dirty.subscribe(function(v) {
            if (!v) {
                self.dirtyMention(false);
            }
        });

        self.messageLine = ko.observable('');
        self.sendMessageLine = function() {
            if (self.messageLine().startsWith("/")) {
                self.handleCommand(self.messageLine());
            } else {
                jabber.sendGroupChat(self.roomName(), self.messageLine());
            }
            self.messageLine('');
        };

        self.tryAnnounceLobby = function(msg) {
            self.writeSystemMessage("TODO: IMPLEMENT THIS FUNCTION"); // TODO
        };

        var commandList = [ '/sethistorylength', '/setcolor', '/tryfixfriends', '/alignright', '/alignleft', '/ownerlist', '/adminlist',
                '/help', '/join', '/mute', '/unmute', '/kick', '/ban', '/banlist', '/unban', '/setrole', '/setaffiliation' ].sort(function(
                a, b) {
            return b.length - a.length;
        });

        var cutStart = function(str, cut) {
            return str.slice(cut.length, str.length);
        };

        self.handleCommand = function(cmd) {
            var command = undefined;

            for (var i = 0; i < commandList.length; i++) {
                if (cmd.startsWith(commandList[i])) {
                    command = commandList[i];
                    break;
                }
            }

            var args = cutStart(cmd, command + " ").split(" ");
            for (var i = 0; i < args.length; i++) {
                if (args[i].endsWith("\\\\")) {
                    args[i] = args[i].slice(0, args[i].length - 1);
                } else if (args[i].endsWith("\\")) {
                    var wSpace = args[i].slice(0, args[i].length - 1) + " ";
                    args[i] = wSpace + args[i + 1];
                    args.splice(i + 1, 1);
                    i--;
                }
            }

            var roomName = self.roomName();

            switch (command) {
            case '/sethistorylength':
                var l = Number(args[0]);
                if (isNaN(l)) {
                    self.writeSystemMessage(l + " is not a number");
                } else {
                    model.maxMessageLogLength(l);
                }
                break;

            case '/setcolor':
                var grp = args[0];
                var clr = args[1];
                if (grp && clr) {
                    switch (grp) {
                    case "own":
                        model.ownColor(clr);
                        break;
                    case "other":
                        model.otherColor(clr);
                        break;
                    case "mod":
                        model.modColor(clr);
                        break;
                    case "owner":
                        model.ownerColor(clr);
                        break;
                    case "muted":
                        model.mutedColor(clr);
                        break;
                    case "blocked":
                        model.blockedColor(clr);
                        break;
                    default:
                        self.writeSystemMessage("unknown group: " + grp);
                        break;
                    }
                } else {
                    self.writeSystemMessage("needs 2 parameters: <group> <html color code>");
                }
                break;

            case '/help':
                writeHelp(args);
                break;

            case '/tryfixfriends':
                model.hackFixFriends();
                break;

            case '/alignleft':
                model.alignChatLeft(true);
                break;

            case '/alignright':
                model.alignChatLeft(false);
                break;

            case '/banlist':
                jabber.showListing(roomName, "outcast");
                break;

            case '/adminlist':
                jabber.showListing(roomName, "admin");
                break;

            case '/ownerlist':
                jabber.showListing(roomName, "owner");
                break;

            case '/join':
                var roomName = args[0];
                model.joinChatRoom(roomName);
                break;

            case '/mute':
                var displayName = args[0];
                var reason = args[1] || '';
                self.mute(displayName, reason);
                break;

            case '/unmute':
                var displayName = args[0];
                var reason = args[1] || '';
                self.unmute(displayName, reason);
                break;

            case '/kick':
                var displayName = args[0];
                var reason = args[1] || '';
                self.kick(displayName, reason);
                break;

            case '/ban':
                var displayName = args[0];
                var reason = args[1] || '';
                var uberId;

                var handles = self.displayNameHandleMap()[displayName];

                if (handles) {
                    uberId = _.last(_.values(handles));
                }

                if (uberId) {

                    self.ban(uberId, reason);

                } else {
                    self.writeSystemMessage(displayName + ' not found');
                }
                break;

            case '/unban':
                var displayName = args[0];
                var reason = args[1] || '';
                var uberId = self.getIdOfBannedUser(displayName);
                if (uberId) {
                    self.unban(uberId, reason);
                } else {
                    self.writeSystemMessage(displayName + ' not found');
                }
                break;

            case "/setrole":
                var name = args[0];
                var role = args[1];
                var reason = args[2] || '';

                var handles = self.displayNameHandleMap()[name];

                if (handles) {

                    _.forEach(handles, function(jid, handle) {
                        console.log('setrole ' + role + ' ' + handle);

                        jabber.setRole(roomName, handle, role, reason);

                    });

                } else {
                    self.writeSystemMessage(name + ' not found');
                }
                break;

            case '/setaffiliation':
                var name = args[0];
                var affiliation = args[1];
                var reason = args[2] || '';
                var uberId;

                var handles = self.displayNameHandleMap()[name];

                if (handles) {
                    uberId = _.last(_.values(handles));
                } else {
                    uberId = self.getIdOfBannedUser(name);
                }

                if (uberId) {
                    console.log('setaffiliation ' + affiliation + ' for ' + uberId + ' ' + reason);
                    jabber.setAffiliation(roomName, uberId, affiliation, reason);
                } else {
                    self.writeSystemMessage(name + ' not found');
                }
                break;

            default:
                self.writeSystemMessage("unknown command: " + cmd);
                break;
            }
        };

        var writeHelp = function(args) {
            if (!args[0]) {
                self.writeSystemMessage("You can minimize PA, if somebody writes your name or private messages you, PA will blink.");
                self.writeSystemMessage("You can write a part of a name and press tab to autocomplete.");
                self.writeSystemMessage("Check out the modding forums PA Chat thread for more info on this chat.");
                self
                        .writeSystemMessage("In general when entering commands you can escape spaces with \\ if you want to end a parameter in \, use \\ for the last backspace");
                self.writeSystemMessage("Admins are moderators by default, the moderator role is not persistent");
                self
                        .writeSystemMessage("Mute is not persistent as well. Use it like a warning. If a user rejoins to get rid of it, first mute them then ban them. This will hide all their messages and prevent them from joining again.");
                self
                        .writeSystemMessage("Try /help commands for a list of available commands, /help <command> for detailed info on one command.");
            } else if (args[0] === 'commands') {
                self.writeSystemMessage("Available commands are: " + commandList.join(', '));
            } else if (args[0] === 'join') {
                self.writeSystemMessage("/join <channelname> joins a chatchannel. If the channel does not exist it will be created.");
            } else if (args[0] === 'announcelobby') {
                self
                        .writeSystemMessage("/announcelobby <msg> can be used to advertise a lobby you are currently in. Only works while in a public lobby.");
            } else if (args[0] === 'mute') {
                self
                        .writeSystemMessage('/mute <user> [<reason>] mutes the given user in the current channel. This requires moderator privileges.');
            } else if (args[0] === 'unmute') {
                self
                        .writeSystemMessage("/unmute <user> [<reason>] unmutes the given user in the current channel. This requires moderator privileges.");
            } else if (args[0] === 'ban') {
                self
                        .writeSystemMessage("/ban <user> [<reason>] bans the given user from the current channel. This requires administrator privileges.");
            } else if (args[0] === 'banlist') {
                self
                        .writeSystemMessage("/banlist prints the list of banned users of the current channel. This requires administrator privileges.");
            } else if (args[0] === 'unban') {
                self
                        .writeSystemMessage("/unban <user> unbans the given user from the current channel. The user has to be on the list of banned users of the current channel (see /help banlist). This requires administrator privileges.");
            } else if (args[0] === 'setrole') {
                self
                        .writeSystemMessage("/setrole <user> <role> [reason] sets the role of the given user in the current channel. This requires administrator or moderator privileges depending on what you want to do.");
                self
                        .writeSystemMessage("Available roles are: visitor (moderator), participant (moderator), none (moderator), moderator (admin)");
            } else if (args[0] === 'setaffiliation') {
                self
                        .writeSystemMessage("/setaffiliation <user> <affiliation> [reason] sets the affiliation of the given user in the current channel. This requires administrator or owner privileges depending on what you want to do.");
                self.writeSystemMessage("Available affiliations are: outcast (admin), none (admin), admin (owner),	owner (owner)");
            } else if (args[0] === "adminlist") {
                self
                        .writeSystemMessage("/adminlist prints the list of admins of the current channel. This requires administrator privileges.");
            } else if (args[0] === "ownerlist") {
                self
                        .writeSystemMessage("/ownerlist prints the list of owners of the current channel. This requires administrator privileges.");
            } else if (args[0] === "alignleft") {
                self.writeSystemMessage("/alignleft aligns the chatwindows to the left");
            } else if (args[0] === "alignright") {
                self.writeSystemMessage("/alignright aligns the chatwindows to the right");
            } else if (args[0] === "tryfixfriends") {
                self
                        .writeSystemMessage("/tryfixfriends tries to repopulate the friendlist. Only use in case your friendlist is bugged and empty. May work or may not work.");
            } else if (args[0] === "setcolor") {
                self.writeSystemMessage("/setcolor <group> <color> tries to change the displaycolor of the given group to the new color.");
                self
                        .writeSystemMessage("Allowed groups are 'own', 'other', 'mod', 'owner', 'muted' and 'blocked'. Colors should be specified according to html/css standards (e.g. hex colors #rrggbb).");
            } else if (args[0] === "sethistorylength") {
                self
                        .writeSystemMessage("/sethistorylength <integer> sets the maximum length before history messages are discarded. Default is 500. Changing requires rejoining a channel to take affect on it.");
            } else {
                self.writeSystemMessage("there is no help for : " + args[0]);
            }
        };

        self.close = function() {
            model.leaveRoom(self.roomName());
        };

        self.writeSystemMessage = function(msg) {
            self.addMessage({
                handle : '',
                roomUser : undefined,
                parts : model.splitURLs(msg),
                content : msg,
                time : new Date().getTime()
            });
        };

        self.tryFillInTypedName = function() {
            var words = self.messageLine().split(" ");
            if (words) {
                var lastWord = words[words.length - 1];
                var candidates = [];
                if (lastWord) {
                    var uid = model.uberId();

                    for (var i = 0; i < self.sortedUsers().length; i++) {
                        var roomUser = self.sortedUsers()[i];

                        if (roomUser.uberId() == uid) {
                            continue;
                        }

                        var name = roomUser.roomDisplayName();

                        if (name.toLowerCase().indexOf(lastWord.toLowerCase()) !== -1) {
                            candidates.push(name);
                        }
                    }
                }

                candidates = _.uniq(candidates, false);

                if (candidates.length === 1) {
                    self.messageLine(self.messageLine().slice(0, self.messageLine().length - lastWord.length) + candidates[0]);
                } else if (candidates.length > 1) {
                    var lst = "";
                    for (var i = 0; i < candidates.length; i++) {
                        lst += candidates[i] + " ";
                    }
                    self.writeSystemMessage(lst);
                }
            }
        };

        self.inputKeyDown = function(s, event) {
            if (event.which === 9) {
                self.tryFillInTypedName();
                return false;
            } else {
                return true;
            }
        };

        // apply to all handles and logins
        self.mute = function(displayName, reason) {
            var handles = self.displayNameHandleMap()[displayName];
            if (handles) {
                _.forEach(handles, function(jid, handle) {
                    console.log('mute ' + handle + ' reason ' + reason);
                    jabber.muteUser(self.roomName(), handle, reason);
                });
            } else {
                self.writeSystemMessage(displayName + ' not found');
            }
        }

        self.unmute = function(displayName, reason) {
            var handles = self.displayNameHandleMap()[displayName];
            if (handles) {
                _.forEach(handles, function(jid, handle) {
                    console.log('unmute ' + handle);
                    jabber.unmuteUser(self.roomName(), handle, reason);
                });
            } else {
                self.writeSystemMessage(displayName + ' not found');
            }
        }

        self.kick = function(displayName, reason) {
            var handles = self.displayNameHandleMap()[displayName];
            if (handles) {
                _.forEach(handles, function(jid, handle) {
                    console.log('kick ' + handle);
                    jabber.kickUser(self.roomName(), handle, reason);
                });
            } else {
                self.writeSystemMessage(displayName + ' not found');
            }
        }

        self.ban = function(uberId, reason) {
            console.log('ban uberId ' + uberId + ' ' + reason);
            jabber.banUser(self.roomName(), uberId, reason);
        }

        self.unban = function(uberId, reason) {
            console.log('unban uberId ' + uberId + ' ' + reason);
            jabber.unbanUser(self.roomName(), uberId, reason);
        }

        self.removeUser = function(jid) {

            var roomUser = self.usersMap()[jid];

            if (!roomUser) {
                console.log('No user in ' + self.roomName() + ' to remove ' + jid);
                return;
            }

            var usedByMessage = self.messageJidMap()[jid];

            if (usedByMessage) {
                console.log('Marking ' + jid + ' (' + roomUser.displayInfo() + ') as removed in ' + roomName);
                roomUser.isRemoved(true);
            } else {
                console.log('Removing ' + jid + ' (' + roomUser.displayInfo() + ') from ' + roomName);
                delete self.usersMap()[jid];
            }

            self.usersMap.notifySubscribers();
        };

    } // end of ChatRoomModel

    // current user will never exist in users so create one
    model.user = ko.observable();

    // removed users are for messages where the user is no longer online
    function makeChatRoomUser(roomName, uberId, handle, admin, mod, muted, league, rank, jid, presenceType, presenceStatus, removed) {
        var user;

        if (uberId == model.uberId()) {
            user = model.user();
        } else {

            model.maybeCreateNewContactWithId(uberId);

            var user = model.idToContactMap()[uberId];

            if (!user) {
                console.log('PANIC THERE IS NO USER');
                debugger;
            }

        }

        user.league(league);
        user.rank(rank);

        var chatUser = new RoomExtendedUserViewModel(user, roomName, uberId, handle, admin, mod, muted, jid, presenceType, presenceStatus,
                removed)

        return chatUser;
    }

    // safer version

    model.hackFixFriends = function() {
        var myUberId = model.uberId();

        _.forEach(jabber.roster(), function(jid) {
            var uberId = jid.split('@')[0];

            if (uberId != myUberId) {
                console.log(uberId);

                model.maybeCreateNewContactWithId(uberId);
                model.addUserTags(uberId, [ 'FRIEND' ]);

                model.idToContactMap()[uberId].tags.notifySubscribers();
            }
        })
    };

// patches

    var oldSetup = model.setup;
    
    model.setup = function() {
        oldSetup();
        if (decode(sessionStorage['restore_jabber'])) {
            jabber.setGrpMsgHandler(model.onGrpChat);
        }
    };

    var oldJabberAuth = handlers.jabber_authentication;

    handlers.jabber_authentication = function(payload) {
        // this is our user that will be used in rooms
        model.user = ko.observable(new ExtendedUserViewModel(model.uberId()));
        
        model.user().displayName(model.displayName());
        
        model.displayName.subscribe(function(name) {
            model.user().displayName(name);
        });

        oldJabberAuth(payload);

        jabber.setGrpMsgHandler(model.onGrpChat);
        jabber.setResultMsgHandler(model.onResultMsg);
        jabber.setErrorMsgHandler(model.onErrorMsg);
        jabber.setConnectHandler(function() {
            model.getRank(function() {
                model.updatePresence();
                if (!decode(localStorage["info.nanodesu.pachat.disablechat"])) {
                    model.joinChatRoom("halcyon");
                }
            });
        });

    };

    var oldCommand = model.onCommand
    
    model.onCommand = function (uberid, command) {
        
        switch( command.message_type ) {
        
            case 'accept_chat_invite':

                model.idToContactMap()[uberid].acceptChatInviteReceived()
                break;
                
            case 'decline_chat_invite':
            
                model.idToContactMap()[uberid].declineChatInviteReceived()
                break;
 
            case 'accept_friend_request':
            
                model.idToContactMap()[uberid].acceptFriendRequestReceived()
                break;
            
            case 'decline_friend_request':
            
                model.idToContactMap()[uberid].declineFriendRequestReceived()
                break;

            default:
                oldCommand(uberid, command);
        }
    };

    var oldPresence = model.onPresence;

    model.onPresence = function(from, handle, uid, presenceType, presenceStatus, grpChat, roomName, userInfo, stati, jid) {
        try {
            if (grpChat) {

                // room level presence

                var isAdmin = userInfo.affiliation === "owner";
                var isModerator = userInfo.role === "moderator" || userInfo.affiliation === "admin";
                var isMuted = userInfo.role === "visitor";

                var room = model.chatRoomMap()[roomName];

                if (presenceType == "error") {
                     if (_.indexOf(stati, '409') != -1) {
                        room.writeSystemMessage( 'Handle ' + handle + ' already in use' );
                        room = false;
                    }
                }

                // we need room and jid for a valid presence update
                
                if (room && jid) {

                    // keep a mapping of from to jid for real time messages
                    room.fromJidMap()[from] = jid; 

                    var roomUser = room.usersMap()[jid];

                    // remove if unavailable

                    if (presenceType == "unavailable") {
                        if (roomUser) {
                            room.removeUser(jid);
                        }
                        if (jid == jabber.jid()) {

                            if (_.indexOf(stati, '307') != -1) {
                                room.writeSystemMessage('Kicked');
                            } else if (_.indexOf(stati, '301') != -1) {
                                room.writeSystemMessage('Banned');
                            }
                        }
                    } else {

                        // otherwise update or add

                        if (roomUser) {

                            console.log('Updating ' + jid + ' (' + roomUser.displayInfo() + ') in ' + roomName + ' ' + presenceType );

                            roomUser.isModerator(isModerator);
                            roomUser.isAdmin(isAdmin);
                            roomUser.isMuted(isMuted);
                            if (userInfo.league) {
                                roomUser.user.league(userInfo.league);
                            }
                            if (userInfo.rank) {
                                roomUser.user.rank(userInfo.rank);
                            }
                            roomUser.isRemoved(false);
                            roomUser.jabberPresenceType(presenceType);
                            roomUser.jabberPresenceStatus(presenceStatus);
                        } else {

                            var roomUser = makeChatRoomUser(roomName, uid, handle, isAdmin, isModerator, isMuted, userInfo.league,
                                    userInfo.rank, jid, presenceType, presenceStatus, removed = false);

                            console.log('Adding ' + jid + ' (' + roomUser.displayInfo() + ') in ' + roomName + ' ' + presenceType );

                            model.insertUserIntoRoom(roomName, roomUser);

                        }

                    }

                }

            } else {

                // update rooms with user level presence

                _.forEach(model.chatRooms(), function(room) {

                    var roomUser = room.usersMap()[jid];
                    if (roomUser) {
                        if (presenceType == "unavailable") {
                            room.removeUser(jid);
                        } else {
                            roomUser.jabberPresenceType(presenceType);
                            roomUser.jabberPresenceStatus(presenceStatus);
                        }
                    }
                });

                // update user level presence with existing uber code

                oldPresence(uid, presenceType, presenceStatus);
            }
        } catch (e) {
            console.log(e);
        }
    };

    var notifyPlayer = function() {
        api.game.outOfGameNotification("");
        api.Panel.message("options_bar", "alertSocial");
    };

    model.onGrpChat = function(roomName, handle, from, uberId, stati, content, timestamp, jid, systemMessage) {
        if (systemMessage) {
            if (content != 'This room is not anonymous') {
                console.log(content);
            }
            return; // ignore for now
        }

        var roomUser;

        var room = model.chatRoomMap()[roomName];

        if (!room) {
            console.log(roomName + ' not found for message from ' + handle + ": " + content);
            return;
        }

        if (!jid) {
            jid = room.fromJidMap()[from];

            if (!jid) {
                console.log('No jid for ' + from + ' in ' + roomName);
            }
        }

        roomUser = room.usersMap()[jid];

        if (roomUser) {
            displayName = roomUser.roomDisplayName();
            room.messageJidMap()[jid] = from; // record that jid is used by a
            // message
        } else {
            console.log('No online user for historical message with jid ' + jid + ' in ' + roomName);

            // user for message if offline so we create a removed user and if
            // they come back online it will be updated

            roomUser = makeChatRoomUser(roomName, uberId, handle, isAdmin = false, isModerator = false, isMuted = false, league = '',
                    rank = '', jid, 'unavailable', undefined, removed = true);

            model.insertUserIntoRoom(roomName, roomUser);
        }

        model.insertMessageIntoRoom(roomName, {
            handle : handle,
            jid : jid,
            roomUser : roomUser,
            content : content,
            time : timestamp
        });
    };

    model.conversations.subscribe(function(c) {
        notifyPlayer();
        for (var i = 0; i < c.length; i++) {
            if (!c.alertSocialMarked) {
                c.alertSocialMarked = true;
                c[i].messageLog.subscribe(function() {
                    notifyPlayer();
                });
            }
        }
    });

    model.getRank = function(callback) {
        console.log('getRank');

        engine.asyncCall('ubernet.getPlayerRating', 'Ladder1v1').done(function(data) {
            try {
                var d = JSON.parse(data);
                model.user().league(d.Rating)
                model.user().rank(d.LeaderboardPosition > 0 ? (d.LeaderboardPosition + "") : "Inactive");
            } catch (e) {
                console.log("failed to get player rank!");
                console.log(e);
            } finally {
                if (callback) {
                    callback();
                }
            }
        }).fail(function(data) {
            console.log("hard fail to get player rank");
            console.log(data);

            if (callback) {
                callback();
            }
        });
    };

    model.updatePresence = function() {
        console.log('updatePresence');

        if (!jabber) {
            return;
        }

        jabber.presenceType(model.jabberPresenceType());
    }

    model.showUberBar.subscribe(function(visible) {
        console.log('showUberBar ' + (visible ? 'yes' : 'no'));

        if (!jabber) {
            return;
        }

        model.jabberPresenceType(visible ? "available" : "dnd");

        _.forEach(model.chatRooms(), function(room) {
            room.scrollDown();
        });

    });

    model.jabberPresenceType.subscribe(function(presenceType) {
        model.getRank(model.updatePresence);
    });

    // need to check this and improve messages

    model.onErrorMsg = function(roomName, action, errorObj) {
        if (action.startsWith('showlisting_')) { // non standard handlers
            // here
            getOrCreateRoom(roomName).writeSystemMessage(action + " " + errorObj.explanation);
        } else {
            getOrCreateRoom(roomName).writeSystemMessage(
                    action + ' ' + (errorObj.roomUser ? errorObj.roomUser.displayName() : 'unknown') + ' (' + errorObj.explanation + ')');
        }
    };

    var resultCount;
    var resultType;
    var resultObj;
    var resultRoom;
    var resultAction;

    model.onResultMsg = function(roomName, action, resObj) {
        if (action.startsWith("showlisting_")) {
            resultType = action;
            resultObj = resObj;
            resultRoom = roomName;
            resultAction = action;
            resultCount = resultObj.length;

            for (var i = 0; i < resultObj.length; i++) {
                // use the new ExtendedUserViewModel
                var roomUser = new ExtendedUserViewModel(resultObj[i].uberId);

                resultObj[i].roomUser = roomUser;

                if (roomUser.hasName()) {
                    resultCount--;
                } else {
                    resultObj[i].roomUser.hasName.subscribe(model.onResultDataReceived);
                }
            }

            if (resultCount === 0) {
                model.onResultDataComplete();
            }
        } else {
            getOrCreateRoom(roomName).writeSystemMessage(
                    'Successfully ' + action + ' ' + (resObj.roomUser ? resObj.roomUser.displayName() : 'unknown')
                            + (resObj.reason ? ' for reason ' + resObj.reason : ''));
        }
    };

    model.onResultDataReceived = function(data) {
        resultCount--;

        if (resultCount === 0) {
            model.onResultDataComplete();
        }
    };

    model.onResultDataComplete = function() {
        var room = getOrCreateRoom(resultRoom);
        room.bannedUsers(resultObj);

        room.writeSystemMessage("Users for " + resultAction);

        for (var i = 0; i < resultObj.length; i++) {
            room.writeSystemMessage(resultObj[i].roomUser.displayName() + (resultObj[i].reason ? ' : ' + resultObj[i].reason : ''));
        }
        room.writeSystemMessage("End of users");
    };

    model.show24HourTime = ko.observable(true).extend({
        local : 'show24HourTime'
    });

    model.toggle24HourTime = function() {
        model.show24HourTime(!model.show24HourTime());
    }

    model.formatTime = function(date, showSeconds) {
        var options = {
            hour : 'numeric',
            minute : 'numeric',
            hour12 : !model.show24HourTime()
        };

        if (showSeconds) {
            options.second = 'numeric';
        }

        var result;

        try {
            result = date.toLocaleTimeString(decode(localStorage.locale), options);
        } catch (e) {
            console.log(e);
            result = date.toLocaleTimeString('en', options);
        }

        return result;
    };

    model.chatRoomMap = ko.observable({/* roomName: ChatRoomModel */});
    model.chatRooms = ko.computed(function() {
        return _.values(model.chatRoomMap());
    });

    var createRoom = function(roomName) {
        var room = model.chatRoomMap()[roomName];
        if (!room) {
            model.chatRoomMap()[roomName] = new ChatRoomModel(roomName);
            model.chatRoomMap.notifySubscribers();
            room = model.chatRoomMap()[roomName];
            room.scrollDown();
        }
        return room;
    };

    var getOrCreateRoom = function(roomName) {
        var room = model.chatRoomMap()[roomName];

        if (!room) {
            model.chatRoomMap()[roomName] = new ChatRoomModel(roomName);
            model.chatRoomMap.notifySubscribers();
            room = model.chatRoomMap()[roomName];
            room.scrollDown();
            jabber.setChannelPresence(roomName, jabber.presenceType(), model.user().league(), model.user().rank());
        }

        return room;

    };

    model.insertUserIntoRoom = function(roomName, roomUser) {
        var room = model.chatRoomMap()[roomName];

        if (!room) {
            console.log('No room ' + roomName + ' to add ' + roomUser.displayInfo());
            return;
        }

        room.usersMap()[roomUser.jid()] = roomUser;
        room.usersMap.notifySubscribers();
    };

    model.insertMessageIntoRoom = function(roomName, message) {
        getOrCreateRoom(roomName).addMessage(message);
    };

    model.joinChatRoom = function(roomName) {
        // open the room first and defer join so we dont miss anything

        var room = model.chatRoomMap()[roomName];

        if (room) {
            room.minimized(false);
        } else {
            room = createRoom(roomName); // create the room before joining

            room.minimized(roomName == 'halcyon');

            var displayName = model.user().displayName();

            _.defer(jabber.joinGroupChat, roomName, model.user().league(), model.user().rank(), displayName);
        }
    };

    model.leaveRoom = function(roomName) {
        var room = model.chatRoomMap()[roomName];
        if (room) {
            jabber.leaveGroupChat(room.roomName());
        }
        delete model.chatRoomMap()[roomName];
        model.chatRoomMap.notifySubscribers();
    }

    model.hideContextMenu = function() {
        var menu = $("#roomContextMenu");
        if (menu) {
            menu.hide();
        }

        var menu = $("#contextMenu");
        if (menu) {
            menu.hide();
        }
    }

    model.joinChannelName = ko.observable('');

    model.selectedRoom = ko.observable(undefined);

    model.selectedRoomUser = ko.observable(undefined);

    model.showRoomContextMenu = function(room, event) {
        var roomUser = this;
        model.hideContextMenu();
        if (roomUser.uberId() == model.uberId()) {
            return false;
        }

        model.selectedRoom(room);
        model.selectedRoomUser(roomUser);

        $("#roomContextMenu").css({
            display : 'block',
            left : event.pageX,
            top : event.pageY
        });

        var ctxMenu = $('#roomContextMenu > .dropdown-menu');
        // fix the context menu staying hidden if you open it on a user very low
        // on the screen
        var bottomMissingSpace = ctxMenu.offset().top - $(window).height() + ctxMenu.height() + 5;
        if (bottomMissingSpace > 0) {
            ctxMenu.css("top", ctxMenu.position().top - bottomMissingSpace);
        }
    };

    model.roomContextMenuClick = function(room, action) {
        var roomUser = this;
        model.selectedRoom(undefined);
        model.selectedRoomUser(undefined);
        switch (action) {
        case 'startChat':
            roomUser.user.startChat();
            break;
        case 'sendFriendRequest':
            roomUser.user.sendFriendRequest();
            break;
        case 'sendChatInvite':
            roomUser.user.sendChatInvite();
            break;
        case 'sendGameInvite':
            roomUser.user.sendInviteToGame();
            break;
        case 'sendUnfriend':
            roomUser.user.sendUnfriend();
            break;
        case 'block':
            roomUser.user.block();
            break;
        case 'unblock':
            roomUser.user.unblock();
            break;
        case 'mute':
            room.mute(roomUser.roomDisplayName(), model.displayName())
            break;
        case 'unmute':
            room.unmute(roomUser.roomDisplayName(), model.displayName())
            break;
        case 'kick':
            room.kick(roomUser.roomDisplayName(), model.displayName())
            break;
        case 'pastats':
            roomUser.getPaStatsIdAndOpen("http://pastats.com/player?player=");
            break;
        case "exodus":
            roomUser.getPaStatsIdAndOpen("http://exodusesports.com?pastats_player_id=");
            break;
        }
    }

    $('.div-seach-cont').parent().append(loadHtml(modBaseDir + "pachat/join_room.html"));
    $('#social-wrapper').prepend(loadHtml(modBaseDir + 'pachat/room_context_menu.html'));
    $('#social-wrapper div.chat-wrapper').append(loadHtml(modBaseDir + 'pachat/rooms.html'));
    $('.div-social-canvas > .chat-wrapper').attr("data-bind",
            "style: {'justify-content': model.alignChatLeft() ? 'flex-start' : 'flex-end'}");
}());