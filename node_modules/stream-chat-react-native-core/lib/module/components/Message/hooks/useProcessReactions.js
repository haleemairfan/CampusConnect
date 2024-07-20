var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useProcessReactions = exports.defaultReactionsSort = void 0;
var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));
var _react = require("react");
var _MessagesContext = require("../../../contexts/messagesContext/MessagesContext");
var defaultReactionsSort = function defaultReactionsSort(a, b) {
  if (a.firstReactionAt && b.firstReactionAt) {
    return +a.firstReactionAt - +b.firstReactionAt;
  }
  return a.type.localeCompare(b.type, 'en');
};
exports.defaultReactionsSort = defaultReactionsSort;
var isOwnReaction = function isOwnReaction(reactionType, ownReactions) {
  return ownReactions ? ownReactions.some(function (reaction) {
    return reaction.type === reactionType;
  }) : false;
};
var isSupportedReaction = function isSupportedReaction(reactionType, supportedReactions) {
  return supportedReactions ? supportedReactions.some(function (reactionOption) {
    return reactionOption.type === reactionType;
  }) : false;
};
var getEmojiByReactionType = function getEmojiByReactionType(reactionType, supportedReactions) {
  var _supportedReactions$f, _supportedReactions$f2;
  return (_supportedReactions$f = (_supportedReactions$f2 = supportedReactions.find(function (_ref) {
    var type = _ref.type;
    return type === reactionType;
  })) == null ? void 0 : _supportedReactions$f2.Icon) != null ? _supportedReactions$f : null;
};
var getLatestReactedUserNames = function getLatestReactedUserNames(reactionType, latestReactions) {
  return latestReactions ? latestReactions.flatMap(function (reaction) {
    if (reactionType && reactionType === reaction.type) {
      var _reaction$user, _reaction$user2;
      var username = ((_reaction$user = reaction.user) == null ? void 0 : _reaction$user.name) || ((_reaction$user2 = reaction.user) == null ? void 0 : _reaction$user2.id);
      return username ? [username] : [];
    }
    return [];
  }) : [];
};
var useProcessReactions = function useProcessReactions(props) {
  var _useMessagesContext = (0, _MessagesContext.useMessagesContext)(),
    contextSupportedReactions = _useMessagesContext.supportedReactions;
  var latest_reactions = props.latest_reactions,
    own_reactions = props.own_reactions,
    reaction_groups = props.reaction_groups,
    _props$sortReactions = props.sortReactions,
    sortReactions = _props$sortReactions === void 0 ? defaultReactionsSort : _props$sortReactions,
    _props$supportedReact = props.supportedReactions,
    supportedReactions = _props$supportedReact === void 0 ? contextSupportedReactions : _props$supportedReact;
  return (0, _react.useMemo)(function () {
    if (!reaction_groups) return {
      existingReactions: [],
      hasReactions: false,
      totalReactionCount: 0
    };
    var unsortedReactions = Object.entries(reaction_groups).flatMap(function (_ref2) {
      var _ref3 = (0, _slicedToArray2["default"])(_ref2, 2),
        reactionType = _ref3[0],
        _ref3$ = _ref3[1],
        count = _ref3$.count,
        first_reaction_at = _ref3$.first_reaction_at,
        last_reaction_at = _ref3$.last_reaction_at;
      if (count === 0 || !isSupportedReaction(reactionType, supportedReactions)) return [];
      var latestReactedUserNames = getLatestReactedUserNames(reactionType, latest_reactions);
      return {
        count: count,
        firstReactionAt: first_reaction_at ? new Date(first_reaction_at) : null,
        Icon: getEmojiByReactionType(reactionType, supportedReactions),
        lastReactionAt: last_reaction_at ? new Date(last_reaction_at) : null,
        latestReactedUserNames: latestReactedUserNames,
        own: isOwnReaction(reactionType, own_reactions),
        type: reactionType,
        unlistedReactedUserCount: count - latestReactedUserNames.length
      };
    });
    return {
      existingReactions: unsortedReactions.sort(sortReactions),
      hasReactions: unsortedReactions.length > 0,
      totalReactionCount: unsortedReactions.reduce(function (total, _ref4) {
        var count = _ref4.count;
        return total + count;
      }, 0)
    };
  }, [reaction_groups, own_reactions == null ? void 0 : own_reactions.length, latest_reactions == null ? void 0 : latest_reactions.length, sortReactions]);
};
exports.useProcessReactions = useProcessReactions;
//# sourceMappingURL=useProcessReactions.js.map