"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateDetailedRoadmapForUser = generateDetailedRoadmapForUser;
var axios_1 = require("axios");
var llm_factory_1 = require("./llm.factory");
var repositories_1 = require("../repositories");
var scheduler_service_1 = require("./scheduler.service");
var GROQ_API_KEY = process.env.GROQ_API_KEY || '';
var GROQ_BASE_URL = 'https://api.groq.com/openai/v1';
var GROQ_MODEL = process.env.GROQ_MODEL || 'llama3-70b-8192';
function startOfDay(date) {
    var copy = new Date(date);
    copy.setHours(0, 0, 0, 0);
    return copy;
}
function addDays(date, days) {
    var copy = new Date(date);
    copy.setDate(copy.getDate() + days);
    return copy;
}
function toWeekday(date) {
    return date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
}
function normalizeAvailability(settings) {
    var defaultDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    var activeDays = Array.isArray(settings === null || settings === void 0 ? void 0 : settings.activeDays)
        ? settings.activeDays.filter(function (value) { return typeof value === 'string'; })
        : defaultDays;
    var minutesPerDay = {
        monday: 60,
        tuesday: 60,
        wednesday: 60,
        thursday: 60,
        friday: 60,
        saturday: 0,
        sunday: 0,
    };
    if ((settings === null || settings === void 0 ? void 0 : settings.dailyMinutes) && typeof settings.dailyMinutes === 'object' && !Array.isArray(settings.dailyMinutes)) {
        for (var _i = 0, _a = Object.keys(minutesPerDay); _i < _a.length; _i++) {
            var weekday = _a[_i];
            var value = settings.dailyMinutes[weekday];
            if (typeof value === 'number' && Number.isFinite(value) && value >= 0) {
                minutesPerDay[weekday] = Math.floor(value);
            }
        }
    }
    return {
        activeDays: activeDays,
        minutesPerDay: minutesPerDay,
    };
}
function parseDurationSeconds(video) {
    var _a, _b, _c;
    if (typeof video.durationSeconds === 'number' && Number.isFinite(video.durationSeconds) && video.durationSeconds > 0) {
        return Math.floor(video.durationSeconds);
    }
    if (typeof video.duration === 'string') {
        var match = video.duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/i);
        if (match) {
            var hours = Number((_a = match[1]) !== null && _a !== void 0 ? _a : 0);
            var minutes = Number((_b = match[2]) !== null && _b !== void 0 ? _b : 0);
            var seconds = Number((_c = match[3]) !== null && _c !== void 0 ? _c : 0);
            var total = hours * 3600 + minutes * 60 + seconds;
            if (total > 0) {
                return total;
            }
        }
    }
    return 900;
}
function normalizeVideos(videos) {
    var seen = new Set();
    return videos
        .map(function (video, index) {
        var _a, _b;
        var id = ((_a = video.id) === null || _a === void 0 ? void 0 : _a.trim()) || "video-".concat(index + 1);
        var url = video.url || video.videoUrl;
        return {
            id: id,
            title: ((_b = video.title) === null || _b === void 0 ? void 0 : _b.trim()) || "Video ".concat(index + 1),
            channelName: video.channelName,
            channelId: video.channelId,
            durationSeconds: parseDurationSeconds(video),
            url: url,
            topicName: video.topicName,
            subtopicName: video.subtopicName,
            playlistId: video.playlistId,
            playlistTitle: video.playlistTitle,
        };
    })
        .filter(function (video) {
        if (seen.has(video.id)) {
            return false;
        }
        seen.add(video.id);
        return true;
    });
}
function getVideoMinutes(video) {
    return Math.ceil(video.durationSeconds / 60);
}
function categorizeTopic(topicName) {
    if (topicName === void 0) { topicName = ''; }
    var proceduralKeywords = ['math', 'coding', 'programming', 'algorithm', 'physics', 'statistics', 'computer'];
    var lowerTopic = topicName.toLowerCase();
    for (var _i = 0, proceduralKeywords_1 = proceduralKeywords; _i < proceduralKeywords_1.length; _i++) {
        var keyword = proceduralKeywords_1[_i];
        if (lowerTopic.includes(keyword))
            return 'PROCEDURAL';
    }
    return 'DECLARATIVE';
}
function getSessionMinutes(videos, topicName) {
    var watch = videos.reduce(function (sum, video) { return sum + getVideoMinutes(video); }, 0);
    var domain = categorizeTopic(topicName);
    var buffer = Math.max(2, Math.round(watch * 0.15)); // Minimum 2 minutes buffer
    var practice = 0;
    var quiz = 0;
    if (domain === 'PROCEDURAL') {
        practice = Math.round(buffer * 0.7);
        quiz = buffer - practice;
    }
    else {
        practice = Math.round(buffer * 0.4);
        quiz = buffer - practice;
    }
    return {
        watch: watch,
        practice: practice,
        quiz: quiz,
        total: watch + practice + quiz,
    };
}
function cleanText(value, fallback) {
    var trimmed = value === null || value === void 0 ? void 0 : value.trim();
    return trimmed && trimmed.length > 0 ? trimmed : fallback;
}
function sentenceFromTopics(topicsCovered) {
    if (topicsCovered.length === 0) {
        return 'the main ideas in this cluster';
    }
    if (topicsCovered.length === 1) {
        return topicsCovered[0];
    }
    if (topicsCovered.length === 2) {
        return "".concat(topicsCovered[0], " and ").concat(topicsCovered[1]);
    }
    return "".concat(topicsCovered.slice(0, -1).join(', '), ", and ").concat(topicsCovered.at(-1));
}
function toConceptTitle(value) {
    return cleanText(value, 'Core concept')
        .replace(/\s+/g, ' ')
        .replace(/^\w/, function (character) { return character.toUpperCase(); });
}
function buildFallbackClusters(videos) {
    var _a, _b, _c;
    if (videos.length === 0) {
        return [];
    }
    var clusters = [];
    var _loop_1 = function (index) {
        var slice = videos.slice(index, index + 3);
        if (slice.length === 1 && clusters.length > 0) {
            var previous = clusters[clusters.length - 1];
            previous.videoIndexes = __spreadArray(__spreadArray([], previous.videoIndexes, true), [index], false);
            previous.topicsCovered = __spreadArray(__spreadArray([], previous.topicsCovered, true), [
                cleanText(((_a = slice[0]) === null || _a === void 0 ? void 0 : _a.subtopicName) || ((_b = slice[0]) === null || _b === void 0 ? void 0 : _b.topicName) || ((_c = slice[0]) === null || _c === void 0 ? void 0 : _c.title), "Video ".concat(index + 1)),
            ], false);
            previous.clusterGoal = "".concat(previous.clusterGoal, "; connect it to ").concat(previous.topicsCovered.at(-1));
            return "continue";
        }
        var titles = slice.map(function (video, offset) { return cleanText(video.subtopicName || video.topicName || video.title, "Video ".concat(index + offset + 1)); });
        clusters.push({
            clusterName: toConceptTitle(titles[0] || "Cluster ".concat(clusters.length + 1)),
            clusterGoal: "Master ".concat(sentenceFromTopics(titles)),
            topicsCovered: titles,
            videoIndexes: slice.map(function (_, offset) { return index + offset; }),
        });
    };
    for (var index = 0; index < videos.length; index += 3) {
        _loop_1(index);
    }
    if (clusters.length > 1) {
        var last = clusters[clusters.length - 1];
        if (last.videoIndexes.length === 1) {
            var previous = clusters[clusters.length - 2];
            previous.videoIndexes = __spreadArray(__spreadArray([], previous.videoIndexes, true), last.videoIndexes, true);
            previous.topicsCovered = __spreadArray(__spreadArray([], previous.topicsCovered, true), last.topicsCovered, true);
            previous.clusterGoal = "".concat(previous.clusterGoal, "; include ").concat(last.clusterName);
            clusters.pop();
        }
    }
    return clusters;
}
function parseClusterSpecs(raw) {
    var json = extractJson(raw);
    if (!json) {
        return null;
    }
    try {
        var parsed = JSON.parse(json);
        if (!Array.isArray(parsed)) {
            return null;
        }
        var clusters = parsed
            .map(function (entry, index) {
            if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
                return null;
            }
            var cluster = entry;
            var clusterName = typeof cluster.clusterName === 'string' ? cluster.clusterName : null;
            var clusterGoal = typeof cluster.clusterGoal === 'string' ? cluster.clusterGoal : null;
            var topicsCovered = Array.isArray(cluster.topicsCovered)
                ? cluster.topicsCovered.filter(function (value) { return typeof value === 'string' && value.trim().length > 0; })
                : [];
            var videoIndexes = Array.isArray(cluster.videoIndexes)
                ? cluster.videoIndexes
                    .filter(function (value) { return typeof value === 'number' && Number.isInteger(value); })
                    .map(function (v) { return v - 1; })
                : [];
            if (!clusterName || !clusterGoal || videoIndexes.length === 0) {
                return null;
            }
            return {
                clusterName: clusterName,
                clusterGoal: clusterGoal,
                topicsCovered: topicsCovered.length > 0 ? topicsCovered : [clusterName],
                videoIndexes: Array.from(new Set(videoIndexes)).sort(function (a, b) { return a - b; }),
            };
        })
            .filter(function (value) { return Boolean(value); });
        return clusters.length > 0 ? clusters : null;
    }
    catch (_a) {
        return null;
    }
}
function normalizeClusterSpecs(clusters, totalVideos) {
    if (totalVideos === 0) {
        return [];
    }
    var ordered = clusters
        .map(function (cluster) { return (__assign(__assign({}, cluster), { videoIndexes: Array.from(new Set(cluster.videoIndexes.filter(function (index) { return index >= 0 && index < totalVideos; }))).sort(function (a, b) { return a - b; }) })); })
        .filter(function (cluster) { return cluster.videoIndexes.length > 0; })
        .sort(function (a, b) { return a.videoIndexes[0] - b.videoIndexes[0]; });
    var assigned = new Set();
    var nextClusters = [];
    for (var _i = 0, ordered_1 = ordered; _i < ordered_1.length; _i++) {
        var cluster = ordered_1[_i];
        var mergedIndexes = cluster.videoIndexes.filter(function (index) { return !assigned.has(index); });
        if (mergedIndexes.length === 0) {
            continue;
        }
        for (var _a = 0, mergedIndexes_1 = mergedIndexes; _a < mergedIndexes_1.length; _a++) {
            var index = mergedIndexes_1[_a];
            assigned.add(index);
        }
        nextClusters.push(__assign(__assign({}, cluster), { videoIndexes: mergedIndexes }));
    }
    for (var index = 0; index < totalVideos; index += 1) {
        if (assigned.has(index)) {
            continue;
        }
        var target = nextClusters[nextClusters.length - 1];
        if (target) {
            target.videoIndexes = __spreadArray(__spreadArray([], target.videoIndexes, true), [index], false).sort(function (a, b) { return a - b; });
            target.topicsCovered = Array.from(new Set(__spreadArray(__spreadArray([], target.topicsCovered, true), [cleanText(String(index), "Video ".concat(index + 1))], false)));
            assigned.add(index);
        }
    }
    var balanced = [];
    for (var _b = 0, nextClusters_1 = nextClusters; _b < nextClusters_1.length; _b++) {
        var cluster = nextClusters_1[_b];
        var sortedIndexes = __spreadArray([], cluster.videoIndexes, true).sort(function (a, b) { return a - b; });
        var cursor = 0;
        while (cursor < sortedIndexes.length) {
            var chunk = sortedIndexes.slice(cursor, cursor + 4);
            cursor += 4;
            if (chunk.length === 1 && balanced.length > 0) {
                var previous = balanced[balanced.length - 1];
                previous.videoIndexes = __spreadArray(__spreadArray([], previous.videoIndexes, true), chunk, true).sort(function (a, b) { return a - b; });
                previous.topicsCovered = Array.from(new Set(__spreadArray(__spreadArray([], previous.topicsCovered, true), cluster.topicsCovered, true)));
                previous.clusterGoal = "".concat(previous.clusterGoal, "; extend into ").concat(cluster.clusterName);
                continue;
            }
            if (chunk.length === 1) {
                balanced.push(__assign(__assign({}, cluster), { videoIndexes: chunk }));
                continue;
            }
            balanced.push(__assign(__assign({}, cluster), { videoIndexes: chunk }));
        }
    }
    return balanced;
}
function clusterVideosWithGroq(topicName, videos) {
    return __awaiter(this, void 0, Promise, function () {
        var numberedTitles, prompt, response, content, parsed, normalized, error_1;
        var _a, _b, _c, _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    if (videos.length === 0) {
                        return [2 /*return*/, []];
                    }
                    if (!GROQ_API_KEY) {
                        return [2 /*return*/, buildFallbackClusters(videos)];
                    }
                    numberedTitles = videos
                        .map(function (video, index) { return "".concat(index + 1, ". ").concat(video.title); })
                        .join('\n');
                    prompt = [
                        "Given these YouTube video titles from a playlist about '".concat(topicName, "':"),
                        numberedTitles,
                        '',
                        'Group them into logical subtopic clusters.',
                        'Rules:',
                        '- Each cluster MUST have 2-4 videos minimum',
                        '- Group by shared concept, not arbitrary count',
                        '- Keep original video order within clusters',
                        "- Cluster name must be specific (NOT 'Introduction' or 'Basics' — YES 'Express Routing and Middleware')",
                        '- Never create a cluster with only 1 video',
                        '- Merge lone videos into the nearest related cluster',
                        '',
                        'Return ONLY JSON, no other text:',
                        '[{',
                        '  clusterName: string,',
                        '  clusterGoal: string,',
                        '  topicsCovered: string[],',
                        '  videoIndexes: number[]',
                        '}]',
                    ].join('\n');
                    _e.label = 1;
                case 1:
                    _e.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, axios_1.default.post("".concat(GROQ_BASE_URL, "/chat/completions"), {
                            model: GROQ_MODEL,
                            temperature: 0.2,
                            messages: [
                                {
                                    role: 'system',
                                    content: 'You are a roadmap clustering assistant. Return JSON only.',
                                },
                                {
                                    role: 'user',
                                    content: prompt,
                                },
                            ],
                        }, {
                            headers: {
                                Authorization: "Bearer ".concat(GROQ_API_KEY),
                                'Content-Type': 'application/json',
                            },
                            timeout: 30000,
                        })];
                case 2:
                    response = _e.sent();
                    content = (_d = (_c = (_b = (_a = response.data) === null || _a === void 0 ? void 0 : _a.choices) === null || _b === void 0 ? void 0 : _b[0]) === null || _c === void 0 ? void 0 : _c.message) === null || _d === void 0 ? void 0 : _d.content;
                    if (typeof content !== 'string') {
                        return [2 /*return*/, buildFallbackClusters(videos)];
                    }
                    parsed = parseClusterSpecs(content);
                    if (!parsed) {
                        return [2 /*return*/, buildFallbackClusters(videos)];
                    }
                    normalized = normalizeClusterSpecs(parsed, videos.length);
                    return [2 /*return*/, normalized.length > 0 ? normalized : buildFallbackClusters(videos)];
                case 3:
                    error_1 = _e.sent();
                    console.warn('[detailedRoadmap] Groq clustering failed:', error_1 instanceof Error ? error_1.message : error_1);
                    return [2 /*return*/, buildFallbackClusters(videos)];
                case 4: return [2 /*return*/];
            }
        });
    });
}
function buildEnrichmentFallback(topicName, cluster) {
    var primaryConcept = toConceptTitle(cluster.topicsCovered[0] || cluster.clusterName || topicName);
    var sessionTitle = "".concat(toConceptTitle(cluster.clusterName), " \u2014 ").concat(primaryConcept);
    var sessionGoal = "By the end of this session, you will be able to ".concat(cluster.clusterGoal.toLowerCase());
    var topicSentence = sentenceFromTopics(cluster.topicsCovered);
    return __assign(__assign({}, cluster), { sessionTitle: sessionTitle, sessionGoal: sessionGoal, practiceTitle: "Mini practice: ".concat(primaryConcept), miniPracticeInstructions: cluster.topicsCovered.map(function (topic, index) {
            var specificConcept = toConceptTitle(topic);
            var practiceTypes = ['flashcard', 'coding', 'written', 'mcq'];
            var practiceType = practiceTypes[index % practiceTypes.length];
            if (practiceType === 'flashcard') {
                return "Write 5 flashcards for ".concat(specificConcept, ". Include a definition, one example, and one common mistake.");
            }
            if (practiceType === 'coding') {
                return "Write a small implementation that demonstrates ".concat(specificConcept, ". Example: build a function or component that uses the idea correctly.");
            }
            if (practiceType === 'written') {
                return "In your own words, explain ".concat(specificConcept, " and describe when you would use it. Give 1 real example.");
            }
            return "Answer these mentally: 1. What does ".concat(specificConcept, " do? 2. When would you use it instead of a simpler approach? 3. What breaks if you skip it?");
        }), quizNote: "5 questions covering: ".concat(cluster.topicsCovered.join(', ')), revisionNote: "In this cluster you covered: ".concat(topicSentence, ". Key things to remember: ").concat(cluster.topicsCovered.slice(0, 3).map(function (item) { return toConceptTitle(item); }).join(', '), ". Common mistake: treating ").concat(primaryConcept.toLowerCase(), " as a generic topic instead of the specific concept it is."), primaryConcept: primaryConcept });
}
function parseEnrichmentSpecs(raw) {
    var json = extractJson(raw);
    if (!json) {
        return null;
    }
    try {
        var parsed = JSON.parse(json);
        if (!Array.isArray(parsed)) {
            return null;
        }
        var items = parsed
            .map(function (entry) {
            if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
                return null;
            }
            var item = entry;
            var miniPracticeInstructions = Array.isArray(item.miniPracticeInstructions)
                ? item.miniPracticeInstructions.filter(function (value) { return typeof value === 'string' && value.trim().length > 0; })
                : [];
            var clusterName = typeof item.clusterName === 'string' ? item.clusterName : null;
            var clusterGoal = typeof item.clusterGoal === 'string' ? item.clusterGoal : null;
            var topicsCovered = Array.isArray(item.topicsCovered)
                ? item.topicsCovered.filter(function (value) { return typeof value === 'string' && value.trim().length > 0; })
                : [];
            var videoIndexes = Array.isArray(item.videoIndexes)
                ? item.videoIndexes.filter(function (value) { return typeof value === 'number' && Number.isInteger(value); })
                : [];
            var sessionTitle = typeof item.sessionTitle === 'string' ? item.sessionTitle : null;
            var sessionGoal = typeof item.sessionGoal === 'string' ? item.sessionGoal : null;
            var practiceTitle = typeof item.practiceTitle === 'string' ? item.practiceTitle : null;
            var quizNote = typeof item.quizNote === 'string' ? item.quizNote : null;
            var revisionNote = typeof item.revisionNote === 'string' ? item.revisionNote : null;
            var primaryConcept = typeof item.primaryConcept === 'string' ? item.primaryConcept : null;
            if (!clusterName ||
                !clusterGoal ||
                !sessionTitle ||
                !sessionGoal ||
                !practiceTitle ||
                !quizNote ||
                !revisionNote ||
                !primaryConcept ||
                videoIndexes.length === 0) {
                return null;
            }
            return {
                clusterName: clusterName,
                clusterGoal: clusterGoal,
                topicsCovered: topicsCovered.length > 0 ? topicsCovered : [primaryConcept],
                videoIndexes: Array.from(new Set(videoIndexes)).sort(function (a, b) { return a - b; }),
                sessionTitle: sessionTitle,
                sessionGoal: sessionGoal,
                practiceTitle: practiceTitle,
                miniPracticeInstructions: miniPracticeInstructions.length > 0 ? miniPracticeInstructions : [clusterGoal],
                quizNote: quizNote,
                revisionNote: revisionNote,
                primaryConcept: primaryConcept,
            };
        })
            .filter(function (value) { return Boolean(value); });
        return items.length > 0 ? items : null;
    }
    catch (_a) {
        return null;
    }
}
function enrichClustersWithGroq(topicName, clusters, videos) {
    return __awaiter(this, void 0, Promise, function () {
        var prompt, response, content, parsed, bySignature_1, error_2;
        var _a, _b, _c, _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    if (clusters.length === 0) {
                        return [2 /*return*/, []];
                    }
                    if (!GROQ_API_KEY) {
                        return [2 /*return*/, clusters.map(function (cluster) { return buildEnrichmentFallback(topicName, cluster); })];
                    }
                    prompt = [
                        "You are refining detailed roadmap clusters for a YouTube playlist about '".concat(topicName, "'."),
                        '',
                        'For each cluster below, return a richer JSON object that keeps the same clusterName, clusterGoal, topicsCovered, and videoIndexes, but adds:',
                        '- sessionTitle: "{ClusterName} — {primary concept}"',
                        '- sessionGoal: "By the end of this session, you will be able to {specific skill}: {specific example}"',
                        '- practiceTitle: a short label for the mini practice',
                        '- miniPracticeInstructions: an array of 2-4 short instructions, each tied to a specific concept from the cluster videos',
                        '- quizNote: "5 questions covering: {topicsCovered.join(', ')}"',
                        '- revisionNote: a proper recap with the covered topics, 2-3 key reminders, and one specific common mistake',
                        '- primaryConcept: the main concept the cluster teaches',
                        '',
                        'Rules:',
                        '- Every miniPractice instruction must mention a specific concept from the cluster, not the whole topic.',
                        '- Vary the miniPractice instructions so they are not repetitive.',
                        '- Never reuse generic text like "reinforce {topic}".',
                        '- Keep each miniPractice instruction to at most 2 sentences.',
                        '- Keep the quizNote specific to the cluster topics, not the overall topic.',
                        '- Keep the sessionGoal specific and outcome-based.',
                        '',
                        'Return ONLY JSON, no explanation.',
                        JSON.stringify(clusters.map(function (cluster, index) { return (__assign(__assign({}, cluster), { videos: cluster.videoIndexes.map(function (videoIndex) {
                                var _a;
                                return ({
                                    index: videoIndex + 1,
                                    title: (_a = videos[videoIndex]) === null || _a === void 0 ? void 0 : _a.title,
                                });
                            }), clusterOrder: index + 1 })); }), null, 2),
                    ].join('\n');
                    _e.label = 1;
                case 1:
                    _e.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, axios_1.default.post("".concat(GROQ_BASE_URL, "/chat/completions"), {
                            model: GROQ_MODEL,
                            temperature: 0.35,
                            messages: [
                                {
                                    role: 'system',
                                    content: 'You enrich roadmap clusters. Return JSON only.',
                                },
                                {
                                    role: 'user',
                                    content: prompt,
                                },
                            ],
                        }, {
                            headers: {
                                Authorization: "Bearer ".concat(GROQ_API_KEY),
                                'Content-Type': 'application/json',
                            },
                            timeout: 30000,
                        })];
                case 2:
                    response = _e.sent();
                    content = (_d = (_c = (_b = (_a = response.data) === null || _a === void 0 ? void 0 : _a.choices) === null || _b === void 0 ? void 0 : _b[0]) === null || _c === void 0 ? void 0 : _c.message) === null || _d === void 0 ? void 0 : _d.content;
                    if (typeof content !== 'string') {
                        return [2 /*return*/, clusters.map(function (cluster) { return buildEnrichmentFallback(topicName, cluster); })];
                    }
                    parsed = parseEnrichmentSpecs(content);
                    if (!parsed) {
                        return [2 /*return*/, clusters.map(function (cluster) { return buildEnrichmentFallback(topicName, cluster); })];
                    }
                    bySignature_1 = new Map(parsed.map(function (item) { return [item.videoIndexes.join(','), item]; }));
                    return [2 /*return*/, clusters.map(function (cluster) {
                            var enriched = bySignature_1.get(cluster.videoIndexes.join(','));
                            return enriched !== null && enriched !== void 0 ? enriched : buildEnrichmentFallback(topicName, cluster);
                        })];
                case 3:
                    error_2 = _e.sent();
                    console.warn('[detailedRoadmap] Groq enrichment failed:', error_2 instanceof Error ? error_2.message : error_2);
                    return [2 /*return*/, clusters.map(function (cluster) { return buildEnrichmentFallback(topicName, cluster); })];
                case 4: return [2 /*return*/];
            }
        });
    });
}
function buildTopicLabel(goalName, topicName, videos) {
    var _a, _b;
    var candidate = ((_a = videos[0]) === null || _a === void 0 ? void 0 : _a.topicName) || ((_b = videos[0]) === null || _b === void 0 ? void 0 : _b.subtopicName) || topicName || goalName;
    return candidate.trim().length > 0 ? candidate : goalName;
}
function buildSessionTitle(topicLabel, videos) {
    var _a;
    var firstTitle = (_a = videos[0]) === null || _a === void 0 ? void 0 : _a.title;
    if (videos.length === 1 && firstTitle) {
        return firstTitle;
    }
    if (videos.length > 1) {
        return "".concat(topicLabel, ": ").concat(videos.length, " video cluster");
    }
    return topicLabel;
}
function buildRoadmapFromClusters(input, availability, clusters, videos) {
    var _a;
    var days = clusters.map(function (cluster, index) {
        var _a;
        var dayNumber = index + 1;
        var clusterVideos = cluster.videoIndexes.map(function (videoIndex) { return videos[videoIndex]; }).filter(function (video) { return Boolean(video); });
        var minutes = getSessionMinutes(clusterVideos, input.topicName);
        var topicLabel = buildTopicLabel(input.goalName, input.topicName, clusterVideos);
        var title = cleanText(cluster.sessionTitle, "".concat(toConceptTitle(cluster.clusterName), " \u2014 ").concat(topicLabel));
        var sessionId = "day-".concat(dayNumber, "-session-1");
        var clusterId = "cluster-".concat(dayNumber);
        var practicePrompt = cluster.miniPracticeInstructions.length > 0
            ? cluster.miniPracticeInstructions.join(' ')
            : "Solve focused drills on ".concat(cluster.primaryConcept, ".");
        var quizPrompt = cluster.quizNote;
        var revisionNote = cluster.revisionNote;
        var phases = [
            {
                id: "".concat(sessionId, "-watch"),
                phase: 'watch',
                title: "Watch ".concat(cluster.clusterName),
                description: "Watch ".concat(clusterVideos.length, " video").concat(clusterVideos.length === 1 ? '' : 's', " covering ").concat(sentenceFromTopics(cluster.topicsCovered), "."),
                estimatedMinutes: minutes.watch,
                videoIds: clusterVideos.map(function (video) { return video.id; }),
            },
            {
                id: "".concat(sessionId, "-practice"),
                phase: 'practice',
                title: cluster.practiceTitle,
                description: practicePrompt,
                estimatedMinutes: minutes.practice,
                videoIds: clusterVideos.map(function (video) { return video.id; }),
                practice: {
                    id: "".concat(sessionId, "-practice-mini"),
                    title: cluster.practiceTitle,
                    prompt: practicePrompt,
                    estimatedMinutes: minutes.practice,
                    format: cluster.miniPracticeInstructions.length > 1 ? 'worked-example' : 'timed-drill',
                    checkpoints: __spreadArray([], cluster.topicsCovered.slice(0, 3).map(function (topic) { return toConceptTitle(topic); }), true),
                },
            },
            {
                id: "".concat(sessionId, "-quiz"),
                phase: 'quiz',
                title: "Full quiz: ".concat(cluster.clusterName),
                description: quizPrompt,
                estimatedMinutes: minutes.quiz,
                videoIds: clusterVideos.map(function (video) { return video.id; }),
                quizPrompt: quizPrompt,
            },
        ];
        return {
            dayNumber: dayNumber,
            label: "Day ".concat(dayNumber),
            title: title,
            summary: cleanText(cluster.sessionGoal, "Build confidence in ".concat(topicLabel, " with a single back-to-back session.")),
            focus: cluster.primaryConcept,
            totalMinutes: minutes.total,
            sessions: [
                {
                    id: sessionId,
                    dayNumber: dayNumber,
                    label: "Day ".concat(dayNumber),
                    title: title,
                    topicName: topicLabel,
                    subtopicName: (_a = clusterVideos[0]) === null || _a === void 0 ? void 0 : _a.subtopicName,
                    clusterId: clusterId,
                    videos: clusterVideos,
                    totalMinutes: minutes.total,
                    phases: phases,
                    keyOutcome: cleanText(cluster.sessionGoal, "By the end of this session, you will be able to apply ".concat(cluster.clusterName.toLowerCase(), ".")),
                    revisitNotes: [revisionNote],
                },
            ],
        };
    });
    var totalMinutes = days.reduce(function (sum, day) { return sum + day.totalMinutes; }, 0);
    return {
        id: "detailed-".concat((_a = input.goalId) !== null && _a !== void 0 ? _a : Date.now()),
        goalId: input.goalId,
        title: "".concat(input.goalName, " - Detailed Roadmap"),
        overview: "A day-by-day learning path for ".concat(input.goalName, " built around watch, practice, and quiz sessions with cluster-specific practice and revision."),
        days: days,
        totalDays: days.length,
        totalMinutes: totalMinutes,
        createdAt: new Date().toISOString(),
        source: 'fallback',
        availability: availability,
        metadata: {
            goalName: input.goalName,
            topicName: input.topicName,
            videoCount: videos.length,
            clusterCount: clusters.length,
        },
    };
}
function extractJson(text) {
    var trimmed = text.trim();
    if (!trimmed) {
        return null;
    }
    var fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
    if (fenced === null || fenced === void 0 ? void 0 : fenced[1]) {
        return fenced[1].trim();
    }
    var start = trimmed.indexOf('{');
    var end = trimmed.lastIndexOf('}');
    if (start >= 0 && end > start) {
        return trimmed.slice(start, end + 1);
    }
    return null;
}
function refineWithGroq(roadmap) {
    return __awaiter(this, void 0, Promise, function () {
        var response, content, json, parsed, error_3;
        var _a, _b, _c, _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    if (!GROQ_API_KEY) {
                        return [2 /*return*/, null];
                    }
                    _e.label = 1;
                case 1:
                    _e.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, axios_1.default.post("".concat(GROQ_BASE_URL, "/chat/completions"), {
                            model: GROQ_MODEL,
                            temperature: 0.3,
                            messages: [
                                {
                                    role: 'system',
                                    content: 'You refine roadmap copy. Return JSON only. Keep the exact day count, day numbers, session count, and watch->practice->quiz order.',
                                },
                                {
                                    role: 'user',
                                    content: "Refine this roadmap into a clearer learning plan without changing its structure. Return JSON with optional title, overview, and per-day title/summary/focus updates only. Roadmap JSON: ".concat(JSON.stringify(roadmap)),
                                },
                            ],
                        }, {
                            headers: {
                                Authorization: "Bearer ".concat(GROQ_API_KEY),
                                'Content-Type': 'application/json',
                            },
                            timeout: 30000,
                        })];
                case 2:
                    response = _e.sent();
                    content = (_d = (_c = (_b = (_a = response.data) === null || _a === void 0 ? void 0 : _a.choices) === null || _b === void 0 ? void 0 : _b[0]) === null || _c === void 0 ? void 0 : _c.message) === null || _d === void 0 ? void 0 : _d.content;
                    if (typeof content !== 'string') {
                        return [2 /*return*/, null];
                    }
                    json = extractJson(content);
                    if (!json) {
                        return [2 /*return*/, null];
                    }
                    parsed = JSON.parse(json);
                    return [2 /*return*/, parsed];
                case 3:
                    error_3 = _e.sent();
                    console.warn('[detailedRoadmap] Groq refinement failed:', error_3 instanceof Error ? error_3.message : error_3);
                    return [2 /*return*/, null];
                case 4: return [2 /*return*/];
            }
        });
    });
}
function refineOverviewWithUniversal(roadmap, userId) {
    return __awaiter(this, void 0, Promise, function () {
        var prompt, _a, error, output;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    prompt = [
                        'Write a concise 2-3 sentence overview for this detailed roadmap.',
                        'Mention that each day follows watch -> practice -> quiz back to back.',
                        'Keep it motivational but practical.',
                        "Roadmap JSON: ".concat(JSON.stringify(roadmap)),
                    ].join('\n');
                    return [4 /*yield*/, (0, llm_factory_1.runUniversalPrompt)(prompt, userId)];
                case 1:
                    _a = _b.sent(), error = _a.error, output = _a.output;
                    if (error || !output.trim()) {
                        return [2 /*return*/, null];
                    }
                    return [2 /*return*/, output.trim()];
            }
        });
    });
}
function mergeRefinements(base, groqRefinement, geminiOverview) {
    var _a, _b;
    var next = __assign(__assign({}, base), { source: groqRefinement ? (geminiOverview ? 'hybrid' : 'groq') : (geminiOverview ? 'gemini' : base.source), title: ((_a = groqRefinement === null || groqRefinement === void 0 ? void 0 : groqRefinement.title) === null || _a === void 0 ? void 0 : _a.trim()) || base.title, overview: geminiOverview || ((_b = groqRefinement === null || groqRefinement === void 0 ? void 0 : groqRefinement.overview) === null || _b === void 0 ? void 0 : _b.trim()) || base.overview, days: base.days.map(function (day) {
            var _a, _b, _c, _d, _e;
            var refinedDay = (_b = (_a = groqRefinement === null || groqRefinement === void 0 ? void 0 : groqRefinement.days) === null || _a === void 0 ? void 0 : _a.find) === null || _b === void 0 ? void 0 : _b.call(_a, function (candidate) { return (candidate === null || candidate === void 0 ? void 0 : candidate.dayNumber) === day.dayNumber; });
            if (!refinedDay) {
                return day;
            }
            return __assign(__assign({}, day), { title: ((_c = refinedDay.title) === null || _c === void 0 ? void 0 : _c.trim()) || day.title, summary: ((_d = refinedDay.summary) === null || _d === void 0 ? void 0 : _d.trim()) || day.summary, focus: ((_e = refinedDay.focus) === null || _e === void 0 ? void 0 : _e.trim()) || day.focus });
        }) });
    return next;
}
function buildPlannerQueues(roadmap, goalId, startDate) {
    var allTasks = [];
    roadmap.days.forEach(function (day) {
        var session = day.sessions[0];
        var deadlineDate = addDays(startOfDay(startDate), Math.max(0, day.dayNumber - 1));
        var tasks = session.phases.map(function (phase, index) {
            var _a, _b, _c;
            return ({
                id: "".concat(session.id, "-").concat(phase.phase),
                taskId: "".concat(session.id, "-").concat(phase.phase),
                title: phase.title,
                type: phase.phase === 'watch' ? 'learn' : phase.phase,
                topicId: session.clusterId,
                subtopicClusterId: session.clusterId,
                scheduledDate: startOfDay(deadlineDate),
                deadlineDate: deadlineDate,
                estimatedMinutes: phase.estimatedMinutes,
                status: 'pending',
                priority: phase.phase === 'watch' ? 'high' : 'medium',
                dependencies: index > 0 ? ["".concat(session.id, "-").concat(session.phases[index - 1].phase)] : [],
                goalId: goalId,
                notes: phase.description,
                videoId: (_a = session.videos[0]) === null || _a === void 0 ? void 0 : _a.id,
                videoUrl: (_b = session.videos[0]) === null || _b === void 0 ? void 0 : _b.url,
                videoTitle: (_c = session.videos[0]) === null || _c === void 0 ? void 0 : _c.title,
                roadmapId: roadmap.id,
                subtopicId: phase.phase,
                sequenceNumber: (day.dayNumber - 1) * 3 + index + 1,
                keyPoints: session.videos.map(function (video) { return video.title; }).slice(0, 4),
                learningOutcomes: [session.keyOutcome],
            });
        });
        allTasks.push.apply(allTasks, tasks);
    });
    var totalMinutes = allTasks.reduce(function (sum, task) { return sum + task.estimatedMinutes; }, 0);
    var finalDeadline = addDays(startOfDay(startDate), Math.max(0, roadmap.days.length - 1));
    return [
        {
            topicId: roadmap.id,
            deadlineDate: finalDeadline,
            tasks: allTasks,
            totalMinutes: totalMinutes,
            remainingMinutes: totalMinutes,
            burnRate: undefined,
        },
    ];
}
function toPriority(taskType) {
    if (taskType === 'watch' || taskType === 'learn') {
        return 'HIGH';
    }
    if (taskType === 'practice') {
        return 'MEDIUM';
    }
    return 'MEDIUM';
}
function mapScheduledTaskToCreateInput(params) {
    var scheduledDate = params.task.scheduledDate ? new Date(params.task.scheduledDate) : new Date();
    return {
        userId: params.userId,
        goalId: params.goalId,
        title: params.task.title,
        description: params.task.notes,
        scheduledDate: scheduledDate,
        estimatedMinutes: params.task.estimatedMinutes,
        priority: toPriority(params.task.type),
        keyPoints: Array.isArray(params.task.keyPoints) ? params.task.keyPoints : undefined,
        learningOutcomes: Array.isArray(params.task.learningOutcomes) ? params.task.learningOutcomes : undefined,
        roadmapId: params.task.roadmapId,
        topicId: params.task.topicId,
        subtopicId: params.task.subtopicId,
        duration: params.task.estimatedMinutes,
        sequenceNumber: params.task.sequenceNumber,
        videoId: params.task.videoId,
        videoUrl: params.task.videoUrl,
        videoTitle: params.task.videoTitle,
    };
}
function parseYouTubeDuration(duration) {
    var match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match)
        return 0;
    return (parseInt(match[1] || '0') * 3600) + (parseInt(match[2] || '0') * 60) + parseInt(match[3] || '0');
}
function fetchVideoDurations(videoIds) {
    return __awaiter(this, void 0, Promise, function () {
        var YOUTUBE_API_KEY, map, i, chunk, details, _i, _a, item, err_1;
        var _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY || '';
                    map = new Map();
                    if (!YOUTUBE_API_KEY || videoIds.length === 0)
                        return [2 /*return*/, map];
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 6, , 7]);
                    i = 0;
                    _c.label = 2;
                case 2:
                    if (!(i < videoIds.length)) return [3 /*break*/, 5];
                    chunk = videoIds.slice(i, i + 50);
                    return [4 /*yield*/, axios_1.default.get('https://www.googleapis.com/youtube/v3/videos', {
                            params: { key: YOUTUBE_API_KEY, id: chunk.join(','), part: 'contentDetails' }
                        })];
                case 3:
                    details = _c.sent();
                    if (details.data.items) {
                        for (_i = 0, _a = details.data.items; _i < _a.length; _i++) {
                            item = _a[_i];
                            map.set(item.id, parseYouTubeDuration(((_b = item.contentDetails) === null || _b === void 0 ? void 0 : _b.duration) || 'PT0S'));
                        }
                    }
                    _c.label = 4;
                case 4:
                    i += 50;
                    return [3 /*break*/, 2];
                case 5: return [3 /*break*/, 7];
                case 6:
                    err_1 = _c.sent();
                    console.error('[detailedRoadmap.service] Failed to fetch video durations:', err_1);
                    return [3 /*break*/, 7];
                case 7: return [2 /*return*/, map];
            }
        });
    });
}
function loadPlaylistVideos(userId, playlistIds) {
    return __awaiter(this, void 0, Promise, function () {
        var playlists, validPlaylists, videos, _i, validPlaylists_1, playlist, _a, _b, item, ytVideoIds, durationsMap, _c, videos_1, video;
        var _d, _e;
        return __generator(this, function (_f) {
            switch (_f.label) {
                case 0: return [4 /*yield*/, Promise.all(playlistIds.map(function (playlistId) { return repositories_1.playlistRepo.findById(playlistId, userId); }))];
                case 1:
                    playlists = _f.sent();
                    validPlaylists = playlists.filter(Boolean);
                    // Sort playlists by name using natural alphanumeric sort to respect `#1`, `#2`, etc.
                    validPlaylists.sort(function (a, b) {
                        return a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' });
                    });
                    videos = [];
                    for (_i = 0, validPlaylists_1 = validPlaylists; _i < validPlaylists_1.length; _i++) {
                        playlist = validPlaylists_1[_i];
                        for (_a = 0, _b = playlist.items; _a < _b.length; _a++) {
                            item = _b[_a];
                            videos.push({
                                id: item.externalId || "".concat(playlist.id, ":").concat(item.sequence),
                                title: item.title,
                                durationSeconds: Math.max(1, ((_d = item.estimatedMinutes) !== null && _d !== void 0 ? _d : 15) * 60),
                                topicName: playlist.name,
                                playlistId: playlist.id,
                                playlistTitle: playlist.name,
                                videoUrl: (_e = item.externalUrl) !== null && _e !== void 0 ? _e : undefined,
                            });
                        }
                    }
                    ytVideoIds = videos.map(function (v) { return v.id; }).filter(function (id) { return id.length === 11 && !id.includes(':'); });
                    return [4 /*yield*/, fetchVideoDurations(ytVideoIds)];
                case 2:
                    durationsMap = _f.sent();
                    for (_c = 0, videos_1 = videos; _c < videos_1.length; _c++) {
                        video = videos_1[_c];
                        if (durationsMap.has(video.id)) {
                            video.durationSeconds = Math.max(1, durationsMap.get(video.id));
                        }
                    }
                    return [2 /*return*/, videos];
            }
        });
    });
}
function dedupeVideos(videos) {
    var seen = new Set();
    return videos.filter(function (video) {
        var key = video.id || video.title;
        if (seen.has(key)) {
            return false;
        }
        seen.add(key);
        return true;
    });
}
function generateDetailedRoadmapForUser(input) {
    return __awaiter(this, void 0, Promise, function () {
        var goal, _a, settings, availability, startDate, playlistVideos, _b, videoSource, goalName, topicName, videos, rawClusters, enrichedClusters, roadmap, plannerTasksCreated, scheduledTasks, topicQueues, scheduled_1;
        var _this = this;
        var _c, _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    if (!input.goalId) return [3 /*break*/, 2];
                    return [4 /*yield*/, repositories_1.goalRepo.findById(input.goalId, input.userId)];
                case 1:
                    _a = _e.sent();
                    return [3 /*break*/, 3];
                case 2:
                    _a = null;
                    _e.label = 3;
                case 3:
                    goal = _a;
                    return [4 /*yield*/, repositories_1.settingsRepo.findByUserId(input.userId)];
                case 4:
                    settings = _e.sent();
                    availability = normalizeAvailability(settings);
                    startDate = input.startDate ? new Date(input.startDate) : new Date();
                    if (!(input.playlistIds && input.playlistIds.length > 0)) return [3 /*break*/, 6];
                    return [4 /*yield*/, loadPlaylistVideos(input.userId, input.playlistIds)];
                case 5:
                    _b = _e.sent();
                    return [3 /*break*/, 7];
                case 6:
                    _b = [];
                    _e.label = 7;
                case 7:
                    playlistVideos = _b;
                    videoSource = dedupeVideos(__spreadArray(__spreadArray([], ((_c = input.videos) !== null && _c !== void 0 ? _c : []), true), playlistVideos, true));
                    goalName = ((_d = goal === null || goal === void 0 ? void 0 : goal.name) === null || _d === void 0 ? void 0 : _d.trim()) || input.goalName.trim() || input.topicName.trim() || 'Learning Goal';
                    topicName = input.topicName.trim() || goalName;
                    videos = normalizeVideos(videoSource);
                    return [4 /*yield*/, clusterVideosWithGroq(topicName, videos)];
                case 8:
                    rawClusters = _e.sent();
                    return [4 /*yield*/, enrichClustersWithGroq(topicName, rawClusters, videos)];
                case 9:
                    enrichedClusters = _e.sent();
                    roadmap = buildRoadmapFromClusters(__assign(__assign({}, input), { goalName: goalName, topicName: topicName, videos: videoSource }), availability, enrichedClusters, videos);
                    plannerTasksCreated = 0;
                    scheduledTasks = 0;
                    if (!input.goalId) return [3 /*break*/, 11];
                    topicQueues = buildPlannerQueues(roadmap, input.goalId, startDate);
                    scheduled_1 = (0, scheduler_service_1.scheduleMultiTopicTasks)(topicQueues, availability, startDate);
                    return [4 /*yield*/, (0, repositories_1.withTransaction)(function (tx) { return __awaiter(_this, void 0, void 0, function () {
                            var existingTasks, existingKeys, newScheduled, newInputs, result, error_4;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, tx.goal.updateMany({
                                            where: { id: input.goalId, userId: input.userId },
                                            data: {
                                                detailedRoadmap: roadmap,
                                            },
                                        })];
                                    case 1:
                                        _a.sent();
                                        return [4 /*yield*/, tx.studyTask.deleteMany({
                                                where: {
                                                    userId: input.userId,
                                                    goalId: input.goalId,
                                                    status: {
                                                        not: 'COMPLETED',
                                                    },
                                                },
                                            })];
                                    case 2:
                                        _a.sent();
                                        return [4 /*yield*/, tx.studyTask.findMany({
                                                where: {
                                                    userId: input.userId,
                                                    goalId: input.goalId,
                                                },
                                            })];
                                    case 3:
                                        existingTasks = _a.sent();
                                        existingKeys = new Set(existingTasks.map(function (t) {
                                            var dateStr = t.scheduledDate instanceof Date
                                                ? t.scheduledDate.toISOString().split('T')[0]
                                                : new Date(t.scheduledDate).toISOString().split('T')[0];
                                            return "".concat(t.topicId || '', "-").concat(t.subtopicId || '', "-").concat(t.type || '', "-").concat(dateStr);
                                        }));
                                        newScheduled = scheduled_1.filter(function (item) {
                                            var dateStr = item.scheduledDate instanceof Date
                                                ? item.scheduledDate.toISOString().split('T')[0]
                                                : new Date(item.scheduledDate).toISOString().split('T')[0];
                                            var key = "".concat(item.topicId || '', "-").concat(item.subtopicId || '', "-").concat(item.type || '', "-").concat(dateStr);
                                            return !existingKeys.has(key);
                                        });
                                        newInputs = newScheduled.map(function (task) { return mapScheduledTaskToCreateInput({
                                            userId: input.userId,
                                            goalId: input.goalId,
                                            task: task,
                                        }); });
                                        if (!(newInputs.length > 0)) return [3 /*break*/, 7];
                                        _a.label = 4;
                                    case 4:
                                        _a.trys.push([4, 6, , 7]);
                                        return [4 /*yield*/, tx.studyTask.createMany({
                                                data: newInputs,
                                            })];
                                    case 5:
                                        result = _a.sent();
                                        plannerTasksCreated = result.count;
                                        return [3 /*break*/, 7];
                                    case 6:
                                        error_4 = _a.sent();
                                        console.error("DB INSERTION FAILED:", error_4);
                                        throw error_4;
                                    case 7: return [2 /*return*/];
                                }
                            });
                        }); })];
                case 10:
                    _e.sent();
                    scheduledTasks = scheduled_1.length;
                    _e.label = 11;
                case 11: return [2 /*return*/, {
                        roadmap: roadmap,
                        plannerTasksCreated: plannerTasksCreated,
                        scheduledTasks: scheduledTasks,
                        source: roadmap.source,
                    }];
            }
        });
    });
}
