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
exports.reassignSlots = reassignSlots;
exports.buildBufferPoolsFromHistory = buildBufferPoolsFromHistory;
exports.decayBufferPoolEntries = decayBufferPoolEntries;
exports.addCompletionToBuffer = addCompletionToBuffer;
exports.scheduleMultiTopicTasks = scheduleMultiTopicTasks;
exports.resolveMissedTasksMultiTopic = resolveMissedTasksMultiTopic;
exports.applyScheduleChange = applyScheduleChange;
var repositories_1 = require("../repositories");
var base_repo_1 = require("../repositories/base.repo");
var serviceErrors_1 = require("./serviceErrors");
var axios_1 = require("axios");
function findNextSlotForTask(userId, fromDate, estimatedMinutes) {
    return __awaiter(this, void 0, Promise, function () {
        var i, candidate, scheduled;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    i = 0;
                    _a.label = 1;
                case 1:
                    if (!(i < 7)) return [3 /*break*/, 4];
                    candidate = new Date(fromDate);
                    candidate.setDate(candidate.getDate() + i);
                    return [4 /*yield*/, repositories_1.taskRepo.getDailyScheduledMinutes(userId, candidate)];
                case 2:
                    scheduled = _a.sent();
                    if (scheduled + estimatedMinutes <= 120) {
                        return [2 /*return*/, candidate];
                    }
                    _a.label = 3;
                case 3:
                    i++;
                    return [3 /*break*/, 1];
                case 4: return [2 /*return*/, null];
            }
        });
    });
}
function reassignSlots(userId, tasks) {
    return __awaiter(this, void 0, void 0, function () {
        var cursor, _i, tasks_1, task, nextSlot, updatedCount;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    cursor = new Date();
                    _i = 0, tasks_1 = tasks;
                    _a.label = 1;
                case 1:
                    if (!(_i < tasks_1.length)) return [3 /*break*/, 5];
                    task = tasks_1[_i];
                    return [4 /*yield*/, findNextSlotForTask(userId, cursor, task.estimatedMinutes)];
                case 2:
                    nextSlot = _a.sent();
                    if (!nextSlot) return [3 /*break*/, 4];
                    return [4 /*yield*/, repositories_1.taskRepo.updateStatus(task.id, userId, "RESCHEDULED", {
                            scheduledDate: nextSlot,
                            rescheduledReason: "Reassigned in scheduler",
                            rescheduleCountIncrement: 1,
                        })];
                case 3:
                    updatedCount = _a.sent();
                    (0, serviceErrors_1.assertRowsAffected)(updatedCount, "Task not found");
                    cursor = nextSlot;
                    _a.label = 4;
                case 4:
                    _i++;
                    return [3 /*break*/, 1];
                case 5: return [2 /*return*/];
            }
        });
    });
}
function squeezeAndSwap(topic) {
    return __awaiter(this, void 0, Promise, function () {
        var YOUTUBE_API_KEY, learnTasks, query, response, items, videoIds, details, parseDuration, selectedVideoId, selectedDurationSeconds, _i, _a, v, d, _b, learnTasks_1, t, error_1;
        var _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY || '';
                    if (!YOUTUBE_API_KEY)
                        return [2 /*return*/];
                    learnTasks = topic.tasks.filter(function (t) { return t.type === 'learn' && t.status !== 'completed'; });
                    if (learnTasks.length === 0)
                        return [2 /*return*/];
                    _d.label = 1;
                case 1:
                    _d.trys.push([1, 4, , 5]);
                    query = "".concat(topic.topicId, " one shot OR crash course");
                    return [4 /*yield*/, axios_1.default.get('https://www.googleapis.com/youtube/v3/search', {
                            params: {
                                key: YOUTUBE_API_KEY,
                                q: query,
                                part: 'snippet',
                                type: 'video',
                                maxResults: 5,
                                videoDuration: 'any',
                            }
                        })];
                case 2:
                    response = _d.sent();
                    items = response.data.items || [];
                    if (items.length === 0)
                        return [2 /*return*/];
                    videoIds = items.map(function (i) { return i.id.videoId; }).filter(Boolean).join(',');
                    if (!videoIds)
                        return [2 /*return*/];
                    return [4 /*yield*/, axios_1.default.get('https://www.googleapis.com/youtube/v3/videos', {
                            params: { key: YOUTUBE_API_KEY, id: videoIds, part: 'contentDetails' }
                        })];
                case 3:
                    details = _d.sent();
                    parseDuration = function (dur) {
                        var match = dur.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
                        if (!match)
                            return 0;
                        return (parseInt(match[1] || '0') * 3600) + (parseInt(match[2] || '0') * 60) + parseInt(match[3] || '0');
                    };
                    selectedVideoId = null;
                    selectedDurationSeconds = 0;
                    for (_i = 0, _a = (details.data.items || []); _i < _a.length; _i++) {
                        v = _a[_i];
                        d = parseDuration(((_c = v.contentDetails) === null || _c === void 0 ? void 0 : _c.duration) || '');
                        if (d > 0 && d < 3600) {
                            selectedVideoId = v.id;
                            selectedDurationSeconds = d;
                            break;
                        }
                    }
                    if (selectedVideoId) {
                        for (_b = 0, learnTasks_1 = learnTasks; _b < learnTasks_1.length; _b++) {
                            t = learnTasks_1[_b];
                            t.videoId = selectedVideoId;
                            t.videoUrl = "https://www.youtube.com/watch?v=".concat(selectedVideoId);
                            t.estimatedMinutes = Math.max(2, Math.round((selectedDurationSeconds / 60) * 1.15));
                            t.title = "One-Shot Summary: " + t.title;
                        }
                    }
                    return [3 /*break*/, 5];
                case 4:
                    error_1 = _d.sent();
                    console.error('SqueezeAndSwap fetch error:', error_1);
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    });
}
function startOfDay(date) {
    var d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
}
function addDays(date, days) {
    var d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
}
function dayName(date) {
    return date.toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();
}
function toYmd(date) {
    return startOfDay(date).toISOString().slice(0, 10);
}
function countActiveDaysBefore(availability, deadline, fromDate) {
    var start = startOfDay(fromDate !== null && fromDate !== void 0 ? fromDate : new Date());
    var end = startOfDay(deadline);
    if (end.getTime() < start.getTime())
        return 0;
    var cursor = addDays(start, 1);
    var count = 0;
    while (cursor.getTime() <= end.getTime()) {
        if (availability.activeDays.includes(dayName(cursor)))
            count += 1;
        cursor = addDays(cursor, 1);
        if (count > 3650)
            break;
    }
    return Math.max(1, count);
}
function buildBufferPoolsFromHistory(tasks) {
    var _a, _b, _c;
    var pools = new Map();
    var now = new Date();
    for (var _i = 0, tasks_2 = tasks; _i < tasks_2.length; _i++) {
        var t = tasks_2[_i];
        if (!t.topicId)
            continue;
        if (!t.scheduledDate || typeof t.actualMinutes !== 'number')
            continue;
        var excess = ((_a = t.actualMinutes) !== null && _a !== void 0 ? _a : 0) - ((_b = t.estimatedMinutes) !== null && _b !== void 0 ? _b : 0);
        if (excess <= 0)
            continue;
        var key = t.topicId;
        var existing = (_c = pools.get(key)) !== null && _c !== void 0 ? _c : { topicId: key, accumulatedMinutes: 0, entries: [] };
        existing.entries.push({ date: startOfDay(t.scheduledDate), minutes: excess });
        existing.accumulatedMinutes += excess;
        pools.set(key, existing);
    }
    for (var _d = 0, _e = pools.values(); _d < _e.length; _d++) {
        var p = _e[_d];
        p.entries = p.entries.filter(function (e) { return (now.getTime() - e.date.getTime()) / (1000 * 60 * 60 * 24) <= 7; });
        p.accumulatedMinutes = p.entries.reduce(function (s, e) { return s + e.minutes; }, 0);
    }
    return Array.from(pools.values());
}
function decayBufferPoolEntries(pool, now) {
    if (now === void 0) { now = new Date(); }
    var entries = pool.entries.filter(function (entry) {
        var ageDays = (now.getTime() - entry.date.getTime()) / (1000 * 60 * 60 * 24);
        return ageDays <= 7;
    });
    return __assign(__assign({}, pool), { entries: entries, accumulatedMinutes: entries.reduce(function (sum, entry) { return sum + entry.minutes; }, 0) });
}
function addCompletionToBuffer(pools, task, completedAt) {
    var _a;
    if (completedAt === void 0) { completedAt = new Date(); }
    if (!task.topicId || typeof task.actualMinutes !== "number") {
        return pools;
    }
    var excess = task.actualMinutes - ((_a = task.estimatedMinutes) !== null && _a !== void 0 ? _a : 0);
    if (excess <= 0) {
        return pools;
    }
    var nextPools = __spreadArray([], pools, true);
    var index = nextPools.findIndex(function (pool) { return pool.topicId === task.topicId; });
    var entry = { date: startOfDay(completedAt), minutes: excess };
    if (index === -1) {
        nextPools.push({
            topicId: task.topicId,
            accumulatedMinutes: excess,
            entries: [entry],
        });
        return nextPools;
    }
    var existing = nextPools[index];
    nextPools[index] = __assign(__assign({}, existing), { accumulatedMinutes: existing.accumulatedMinutes + excess, entries: __spreadArray(__spreadArray([], existing.entries, true), [entry], false) });
    return nextPools;
}
function findBufferPoolForTopic(pools, topicId) {
    if (!topicId)
        return undefined;
    return pools.find(function (p) { return p.topicId === topicId; });
}
function scheduleMultiTopicTasks(topics, availability, startDate) {
    var _a, _b, _c, _d, _e, _f, _g;
    if (startDate === void 0) { startDate = new Date(); }
    // Enforce sequential sorting strictly
    for (var _i = 0, topics_1 = topics; _i < topics_1.length; _i++) {
        var t = topics_1[_i];
        t.tasks.sort(function (a, b) { var _a, _b; return ((_a = a.sequenceNumber) !== null && _a !== void 0 ? _a : 0) - ((_b = b.sequenceNumber) !== null && _b !== void 0 ? _b : 0); });
    }
    var start = startOfDay(startDate !== null && startDate !== void 0 ? startDate : new Date());
    var activeDays = availability.activeDays;
    var dailyMinutes = availability.minutesPerDay;
    // initialize burnRates
    for (var _h = 0, topics_2 = topics; _h < topics_2.length; _h++) {
        var t = topics_2[_h];
        var days = countActiveDaysBefore(availability, t.deadlineDate, start);
        t.burnRate = t.remainingMinutes / Math.max(1, days);
    }
    var scheduled = [];
    var cursor = new Date(start);
    var daysProcessed = 0;
    var safetyDays = 365;
    while (topics.some(function (t) { return t.remainingMinutes > 0; }) && daysProcessed < safetyDays) {
        // move to next active day
        while (!activeDays.includes(dayName(cursor)))
            cursor = addDays(cursor, 1);
        var weekday = dayName(cursor);
        var minutesPerDay = (_a = dailyMinutes[weekday]) !== null && _a !== void 0 ? _a : 60;
        var remainingDayBudget = minutesPerDay;
        var openTopics = topics.filter(function (t) { return t.remainingMinutes > 0; }).sort(function (a, b) { var _a, _b; return ((_a = b.burnRate) !== null && _a !== void 0 ? _a : 0) - ((_b = a.burnRate) !== null && _b !== void 0 ? _b : 0); });
        var totalBurn = openTopics.reduce(function (s, t) { var _a; return s + ((_a = t.burnRate) !== null && _a !== void 0 ? _a : 0); }, 0) || 1;
        for (var _j = 0, openTopics_1 = openTopics; _j < openTopics_1.length; _j++) {
            var topic = openTopics_1[_j];
            if (remainingDayBudget <= 0)
                break;
            var proportionalShare = Math.floor((((_b = topic.burnRate) !== null && _b !== void 0 ? _b : 0) / totalBurn) * minutesPerDay);
            var share = Math.max(0, Math.min(remainingDayBudget, proportionalShare || Math.min(remainingDayBudget, topic.remainingMinutes)));
            var allocated = 0;
            var pending = topic.tasks;
            var idx = pending.findIndex(function (p) { return !scheduled.some(function (s) { return s.taskId === p.taskId; }); });
            if (idx === -1)
                idx = 0;
            while (idx < pending.length && allocated < share && remainingDayBudget > 0) {
                var clusterId = (_c = pending[idx].subtopicClusterId) !== null && _c !== void 0 ? _c : "".concat(topic.topicId, "::").concat((_d = pending[idx].taskId) !== null && _d !== void 0 ? _d : pending[idx].id);
                var clusterTasks = [];
                var ci = idx;
                while (ci < pending.length && ((_e = pending[ci].subtopicClusterId) !== null && _e !== void 0 ? _e : "".concat(topic.topicId, "::").concat((_f = pending[ci].taskId) !== null && _f !== void 0 ? _f : pending[ci].id)) === clusterId) {
                    clusterTasks.push(pending[ci]);
                    ci += 1;
                }
                var clusterTotal = clusterTasks.reduce(function (s, c) { var _a; return s + ((_a = c.estimatedMinutes) !== null && _a !== void 0 ? _a : 0); }, 0);
                if (clusterTotal <= Math.max(remainingDayBudget, 0) && clusterTotal <= share - allocated) {
                    for (var _k = 0, clusterTasks_1 = clusterTasks; _k < clusterTasks_1.length; _k++) {
                        var ct = clusterTasks_1[_k];
                        scheduled.push(__assign(__assign({}, ct), { scheduledDate: startOfDay(cursor) }));
                    }
                    allocated += clusterTotal;
                    remainingDayBudget -= clusterTotal;
                    topic.remainingMinutes = Math.max(0, topic.remainingMinutes - clusterTotal);
                    idx = ci;
                    continue;
                }
                if (clusterTotal <= remainingDayBudget) {
                    for (var _l = 0, clusterTasks_2 = clusterTasks; _l < clusterTasks_2.length; _l++) {
                        var ct = clusterTasks_2[_l];
                        scheduled.push(__assign(__assign({}, ct), { scheduledDate: startOfDay(cursor) }));
                    }
                    allocated += clusterTotal;
                    remainingDayBudget -= clusterTotal;
                    topic.remainingMinutes = Math.max(0, topic.remainingMinutes - clusterTotal);
                    idx = ci;
                    break;
                }
                if (clusterTotal > minutesPerDay) {
                    if (remainingDayBudget === minutesPerDay) {
                        for (var _m = 0, clusterTasks_3 = clusterTasks; _m < clusterTasks_3.length; _m++) {
                            var ct = clusterTasks_3[_m];
                            scheduled.push(__assign(__assign({}, ct), { scheduledDate: startOfDay(cursor) }));
                        }
                        allocated += clusterTotal;
                        remainingDayBudget = 0;
                        topic.remainingMinutes = Math.max(0, topic.remainingMinutes - clusterTotal);
                        idx = ci;
                    }
                }
                break;
            }
        }
        // deadline safety check
        for (var _o = 0, topics_3 = topics; _o < topics_3.length; _o++) {
            var t = topics_3[_o];
            if (t.remainingMinutes <= 0)
                continue;
            var daysLeft = countActiveDaysBefore(availability, t.deadlineDate, cursor);
            var perDayNeeded = t.remainingMinutes / Math.max(1, daysLeft);
            var maxPerDay = Math.max.apply(Math, Object.values(dailyMinutes));
            if (perDayNeeded > maxPerDay) {
                t.burnRate = (_g = t.burnRate) !== null && _g !== void 0 ? _g : 0;
            }
        }
        cursor = addDays(cursor, 1);
        daysProcessed += 1;
        for (var _p = 0, topics_4 = topics; _p < topics_4.length; _p++) {
            var t = topics_4[_p];
            if (t.remainingMinutes <= 0) {
                t.burnRate = 0;
                continue;
            }
            t.burnRate = t.remainingMinutes / Math.max(1, countActiveDaysBefore(availability, t.deadlineDate, cursor));
        }
    }
    return scheduled;
}
function resolveMissedTasksMultiTopic(allTasks, missedTaskIds, today, availability) {
    return __awaiter(this, void 0, Promise, function () {
        var warnings, updated, pools, missTasks, dayMap, _i, updated_1, t, key, list, missedDays, classifications, _a, missTasks_1, t, key, dayTasks, prev, missDates, i, count, start, j, _b, missTasks_2, t, byTopic, _c, missTasks_3, m, list, applied, suggestions, forceGlobalRebalance, _loop_1, _d, _e, _f, topicId, tasks, state_1, _g, updated_2, task, revisionTask, missedDayCount, grouped, incomplete, topicsArr, map, _h, incomplete_1, t, l, _j, _k, _l, tid, list, total, deadline, type, _m, topicsArr_1, t, rescheduled, activeLeft, capacity, totalRem, deficit, minExtraDays, dropCandidates, dropped, _o, dropCandidates_1, d;
        var _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4, _5, _6, _7, _8, _9, _10, _11, _12, _13, _14, _15, _16;
        return __generator(this, function (_17) {
            switch (_17.label) {
                case 0:
                    warnings = [];
                    updated = allTasks.map(function (t) { return (__assign({}, t)); });
                    pools = buildBufferPoolsFromHistory(updated);
                    missTasks = updated.filter(function (t) { return missedTaskIds.includes(t.id); });
                    dayMap = new Map();
                    for (_i = 0, updated_1 = updated; _i < updated_1.length; _i++) {
                        t = updated_1[_i];
                        key = toYmd((_p = t.scheduledDate) !== null && _p !== void 0 ? _p : new Date());
                        list = (_q = dayMap.get(key)) !== null && _q !== void 0 ? _q : [];
                        list.push(t);
                        dayMap.set(key, list);
                    }
                    missedDays = new Set(missTasks.map(function (t) { var _a; return toYmd((_a = t.scheduledDate) !== null && _a !== void 0 ? _a : new Date()); }));
                    classifications = new Map();
                    for (_a = 0, missTasks_1 = missTasks; _a < missTasks_1.length; _a++) {
                        t = missTasks_1[_a];
                        key = toYmd((_r = t.scheduledDate) !== null && _r !== void 0 ? _r : new Date());
                        dayTasks = (_s = dayMap.get(key)) !== null && _s !== void 0 ? _s : [];
                        if (dayTasks.every(function (d) { return missedTaskIds.includes(d.id); })) {
                            classifications.set(t.id, 'day_miss');
                            continue;
                        }
                        prev = toYmd(addDays(new Date((_t = t.scheduledDate) !== null && _t !== void 0 ? _t : new Date()), -1));
                        if (missedDays.has(prev)) {
                            classifications.set(t.id, 'streak');
                            continue;
                        }
                        classifications.set(t.id, 'isolated');
                    }
                    missDates = __spreadArray([], missTasks.map(function (t) { var _a; return new Date((_a = t.scheduledDate) !== null && _a !== void 0 ? _a : new Date()).getTime(); }), true).sort();
                    for (i = 0; i < missDates.length; i++) {
                        count = 1;
                        start = missDates[i];
                        for (j = i + 1; j < missDates.length; j++) {
                            if ((missDates[j] - start) / (1000 * 60 * 60 * 24) <= 7)
                                count += 1;
                        }
                        if (count >= 4) {
                            for (_b = 0, missTasks_2 = missTasks; _b < missTasks_2.length; _b++) {
                                t = missTasks_2[_b];
                                classifications.set(t.id, 'burnout');
                            }
                            break;
                        }
                    }
                    byTopic = new Map();
                    for (_c = 0, missTasks_3 = missTasks; _c < missTasks_3.length; _c++) {
                        m = missTasks_3[_c];
                        list = (_v = byTopic.get((_u = m.topicId) !== null && _u !== void 0 ? _u : 'unknown')) !== null && _v !== void 0 ? _v : [];
                        list.push(m);
                        byTopic.set((_w = m.topicId) !== null && _w !== void 0 ? _w : 'unknown', list);
                    }
                    applied = 'absorb';
                    suggestions = [];
                    forceGlobalRebalance = missedDays.size >= 3;
                    if (forceGlobalRebalance) {
                        applied = 'global_rebalance';
                    }
                    _loop_1 = function (topicId, tasks) {
                        if (forceGlobalRebalance) {
                            return "break";
                        }
                        var remaining = updated
                            .filter(function (x) { return x.topicId === topicId && x.status !== 'completed'; })
                            .reduce(function (s, x) { var _a; return s + ((_a = x.estimatedMinutes) !== null && _a !== void 0 ? _a : 0); }, 0);
                        var deadline = (_y = (_x = tasks[0]) === null || _x === void 0 ? void 0 : _x.deadlineDate) !== null && _y !== void 0 ? _y : addDays(today, 7);
                        var daysLeft = countActiveDaysBefore(availability, deadline, today);
                        var burn = remaining / Math.max(1, daysLeft);
                        if (burn > Math.max.apply(Math, Object.values(availability.minutesPerDay))) {
                            warnings.push({
                                topicId: topicId,
                                severity: "high",
                                code: "AT_RISK",
                                message: "Topic needs more time than the current daily budget allows.",
                                suggestedActions: [
                                    {
                                        type: "increase-budget",
                                        label: "Increase daily budget",
                                        details: "Increase minutes per day to reduce rescheduling pressure.",
                                    },
                                    {
                                        type: "extend-deadline",
                                        label: "Extend deadline",
                                        details: "Move the deadline out to create more active days.",
                                    },
                                ],
                            });
                        }
                        var _loop_2 = function (missed) {
                            var cls = (_z = classifications.get(missed.id)) !== null && _z !== void 0 ? _z : 'isolated';
                            var pool = findBufferPoolForTopic(pools, topicId);
                            if (cls === 'isolated' && pool && pool.accumulatedMinutes >= ((_0 = missed.estimatedMinutes) !== null && _0 !== void 0 ? _0 : 0)) {
                                pool.accumulatedMinutes -= ((_1 = missed.estimatedMinutes) !== null && _1 !== void 0 ? _1 : 0);
                                missed.scheduledDate = addDays(today, 1);
                                missed.rescheduleCount = ((_2 = missed.rescheduleCount) !== null && _2 !== void 0 ? _2 : 0) + 1;
                                missed.status = 'pending';
                                applied = 'absorb';
                                return "continue";
                            }
                            var avgPerDay = Math.floor(Object.values(availability.minutesPerDay).reduce(function (s, v) { return s + v; }, 0) / Math.max(1, availability.activeDays.length));
                            if (cls === 'isolated' && daysLeft * avgPerDay >= remaining) {
                                missed.scheduledDate = addDays(today, 1);
                                missed.rescheduleCount = ((_3 = missed.rescheduleCount) !== null && _3 !== void 0 ? _3 : 0) + 1;
                                missed.status = 'pending';
                                applied = 'absorb';
                                return "continue";
                            }
                            // Push forward
                            missed.scheduledDate = addDays(today, 1);
                            missed.rescheduleCount = ((_4 = missed.rescheduleCount) !== null && _4 !== void 0 ? _4 : 0) + 1;
                            missed.status = 'pending';
                            applied = 'push_forward';
                            // chain shift within topic by 1 day
                            var later = updated.filter(function (x) { var _a, _b; return x.topicId === topicId && ((_a = x.scheduledDate) !== null && _a !== void 0 ? _a : new Date()) > ((_b = missed.scheduledDate) !== null && _b !== void 0 ? _b : new Date()); })
                                .sort(function (a, b) { var _a, _b; return ((_a = a.scheduledDate) !== null && _a !== void 0 ? _a : new Date()).getTime() - ((_b = b.scheduledDate) !== null && _b !== void 0 ? _b : new Date()).getTime(); });
                            for (var _19 = 0, later_1 = later; _19 < later_1.length; _19++) {
                                var lt = later_1[_19];
                                lt.scheduledDate = addDays((_5 = lt.scheduledDate) !== null && _5 !== void 0 ? _5 : today, 1);
                                lt.rescheduleCount = ((_6 = lt.rescheduleCount) !== null && _6 !== void 0 ? _6 : 0) + 1;
                            }
                            var last = later[later.length - 1];
                            if (last && ((_7 = last.scheduledDate) !== null && _7 !== void 0 ? _7 : new Date()).getTime() > (deadline).getTime()) {
                                applied = 'global_rebalance';
                                return "break";
                            }
                        };
                        for (var _18 = 0, tasks_3 = tasks; _18 < tasks_3.length; _18++) {
                            var missed = tasks_3[_18];
                            var state_2 = _loop_2(missed);
                            if (state_2 === "break")
                                break;
                        }
                        if (applied === 'global_rebalance')
                            return "break";
                    };
                    for (_d = 0, _e = byTopic.entries(); _d < _e.length; _d++) {
                        _f = _e[_d], topicId = _f[0], tasks = _f[1];
                        state_1 = _loop_1(topicId, tasks);
                        if (state_1 === "break")
                            break;
                    }
                    for (_g = 0, updated_2 = updated; _g < updated_2.length; _g++) {
                        task = updated_2[_g];
                        if (((_8 = task.rescheduleCount) !== null && _8 !== void 0 ? _8 : 0) >= 3 && task.type !== 'revision') {
                            revisionTask = task;
                            revisionTask.type = 'revision';
                            revisionTask.originalEstimatedMinutes = (_9 = revisionTask.originalEstimatedMinutes) !== null && _9 !== void 0 ? _9 : revisionTask.estimatedMinutes;
                            revisionTask.estimatedMinutes = Math.max(1, Math.round(((_10 = revisionTask.originalEstimatedMinutes) !== null && _10 !== void 0 ? _10 : revisionTask.estimatedMinutes) * 0.4));
                            revisionTask.notes = "".concat(revisionTask.notes ? "".concat(revisionTask.notes, " ") : '', "Converted to revision after 3 missed attempts.");
                        }
                    }
                    missedDayCount = new Set(missTasks.map(function (task) { var _a; return toYmd((_a = task.scheduledDate) !== null && _a !== void 0 ? _a : new Date()); })).size;
                    if (missedDayCount >= 3 && applied !== 'global_rebalance') {
                        applied = 'global_rebalance';
                    }
                    if (!(applied === 'global_rebalance')) return [3 /*break*/, 5];
                    grouped = new Map();
                    incomplete = updated.filter(function (t) { return t.status !== 'completed'; });
                    topicsArr = [];
                    map = new Map();
                    for (_h = 0, incomplete_1 = incomplete; _h < incomplete_1.length; _h++) {
                        t = incomplete_1[_h];
                        l = (_12 = map.get((_11 = t.topicId) !== null && _11 !== void 0 ? _11 : 'unknown')) !== null && _12 !== void 0 ? _12 : [];
                        l.push(t);
                        map.set((_13 = t.topicId) !== null && _13 !== void 0 ? _13 : 'unknown', l);
                    }
                    for (_j = 0, _k = map.entries(); _j < _k.length; _j++) {
                        _l = _k[_j], tid = _l[0], list = _l[1];
                        total = list.reduce(function (s, x) { var _a; return s + ((_a = x.estimatedMinutes) !== null && _a !== void 0 ? _a : 0); }, 0);
                        deadline = (_15 = (_14 = list.find(function (x) { return x.deadlineDate; })) === null || _14 === void 0 ? void 0 : _14.deadlineDate) !== null && _15 !== void 0 ? _15 : addDays(today, 7);
                        type = (_16 = list.find(function (x) { return x.goalType; })) === null || _16 === void 0 ? void 0 : _16.goalType;
                        topicsArr.push({ topicId: tid, deadlineDate: deadline, tasks: list, totalMinutes: total, remainingMinutes: total, type: type });
                    }
                    _m = 0, topicsArr_1 = topicsArr;
                    _17.label = 1;
                case 1:
                    if (!(_m < topicsArr_1.length)) return [3 /*break*/, 4];
                    t = topicsArr_1[_m];
                    if (!(t.type === 'exam')) return [3 /*break*/, 3];
                    return [4 /*yield*/, squeezeAndSwap(t)];
                case 2:
                    _17.sent();
                    t.remainingMinutes = t.tasks.reduce(function (s, x) { var _a; return s + ((_a = x.estimatedMinutes) !== null && _a !== void 0 ? _a : 0); }, 0);
                    t.totalMinutes = t.remainingMinutes;
                    _17.label = 3;
                case 3:
                    _m++;
                    return [3 /*break*/, 1];
                case 4:
                    rescheduled = scheduleMultiTopicTasks(topicsArr, availability, today);
                    activeLeft = countActiveDaysBefore(availability, addDays(today, 30), today);
                    capacity = activeLeft * Math.max.apply(Math, Object.values(availability.minutesPerDay));
                    totalRem = topicsArr.reduce(function (s, t) { return s + t.remainingMinutes; }, 0);
                    if (totalRem > capacity) {
                        suggestions.push({ type: 'increase-budget', label: 'Increase daily budget', details: 'Increase minutes per day to meet deadlines.' });
                        deficit = totalRem - capacity;
                        minExtraDays = Math.ceil(deficit / Math.max.apply(Math, Object.values(availability.minutesPerDay)));
                        suggestions.push({ type: 'extend-deadline', label: 'Extend deadlines', details: "Extend by at least ".concat(minExtraDays, " days.") });
                        dropCandidates = incomplete.filter(function (t) { return (t.type === 'quiz' || t.type === 'practice') && t.goalType !== 'exam'; });
                        dropped = 0;
                        for (_o = 0, dropCandidates_1 = dropCandidates; _o < dropCandidates_1.length; _o++) {
                            d = dropCandidates_1[_o];
                            d.status = 'skipped';
                            dropped += d.estimatedMinutes;
                            if (totalRem - dropped <= capacity)
                                break;
                        }
                    }
                    return [2 /*return*/, { updatedTasks: updated, warnings: warnings, appliedStrategy: 'global_rebalance', suggestedActions: suggestions }];
                case 5: return [2 /*return*/, { updatedTasks: updated, warnings: warnings, appliedStrategy: applied, suggestedActions: suggestions }];
            }
        });
    });
}
function applyScheduleChange(userId, date, change) {
    return __awaiter(this, void 0, Promise, function () {
        var targetDate, nextDay;
        var _this = this;
        return __generator(this, function (_a) {
            targetDate = startOfDay(date);
            nextDay = addDays(targetDate, 1);
            // Execute in a serialized transaction
            return [2 /*return*/, base_repo_1.prisma.$transaction(function (tx) { return __awaiter(_this, void 0, void 0, function () {
                    var settings, weekday, dailyMinutes, dailyBudget, existingTasks, currentScheduledMinutes, deltaMinutes, originalTask, originalTask, updatedTask, updateData;
                    var _a, _b, _c, _d, _e, _f;
                    return __generator(this, function (_g) {
                        switch (_g.label) {
                            case 0: return [4 /*yield*/, tx.userSettings.findUnique({
                                    where: { userId: userId },
                                })];
                            case 1:
                                settings = _g.sent();
                                weekday = dayName(targetDate);
                                dailyMinutes = settings === null || settings === void 0 ? void 0 : settings.dailyMinutes;
                                dailyBudget = (_a = dailyMinutes === null || dailyMinutes === void 0 ? void 0 : dailyMinutes[weekday]) !== null && _a !== void 0 ? _a : 60;
                                return [4 /*yield*/, tx.studyTask.findMany({
                                        where: {
                                            userId: userId,
                                            scheduledDate: {
                                                gte: targetDate,
                                                lt: nextDay,
                                            },
                                        },
                                        // Using raw query for FOR UPDATE if strictly necessary, but within SERIALIZABLE or by locking user settings, we can avoid phantom reads.
                                        // Since prisma doesn't support table-level locks easily without raw query, we'll sum up current minutes manually.
                                    })];
                            case 2:
                                existingTasks = _g.sent();
                                currentScheduledMinutes = existingTasks.reduce(function (sum, t) { return sum + t.estimatedMinutes; }, 0);
                                deltaMinutes = 0;
                                if (change.type === "create") {
                                    deltaMinutes = (_b = change.task.estimatedMinutes) !== null && _b !== void 0 ? _b : 25;
                                }
                                else if (change.type === "edit") {
                                    originalTask = existingTasks.find(function (t) { return t.id === change.task.id; });
                                    if (originalTask && change.task.estimatedMinutes !== undefined) {
                                        deltaMinutes = change.task.estimatedMinutes - originalTask.estimatedMinutes;
                                    }
                                }
                                else if (change.type === "delete") {
                                    originalTask = existingTasks.find(function (t) { return t.id === change.task.id; });
                                    if (originalTask) {
                                        deltaMinutes = -originalTask.estimatedMinutes;
                                    }
                                }
                                // 3. Check for capacity overflow
                                if (currentScheduledMinutes + deltaMinutes > dailyBudget && deltaMinutes > 0) {
                                    // Abort change, return conflict
                                    return [2 /*return*/, {
                                            success: false,
                                            conflict: true,
                                            suggestedActions: [
                                                {
                                                    type: "increase-budget",
                                                    label: "Increase daily budget",
                                                    details: "This action requires ".concat(currentScheduledMinutes + deltaMinutes - dailyBudget, " more minutes than your budget of ").concat(dailyBudget, "m for ").concat(weekday, "."),
                                                },
                                            ],
                                        }];
                                }
                                updatedTask = undefined;
                                if (!(change.type === "create")) return [3 /*break*/, 4];
                                return [4 /*yield*/, tx.studyTask.create({
                                        data: __assign(__assign({ userId: userId, title: (_c = change.task.title) !== null && _c !== void 0 ? _c : "New Task", estimatedMinutes: (_d = change.task.estimatedMinutes) !== null && _d !== void 0 ? _d : 25, scheduledDate: targetDate, priority: (_e = change.task.priority) !== null && _e !== void 0 ? _e : "MEDIUM", status: (_f = change.task.status) !== null && _f !== void 0 ? _f : "SCHEDULED" }, (change.task.goalId && { goalId: change.task.goalId })), (change.task.skillId && { skillId: change.task.skillId })),
                                    })];
                            case 3:
                                updatedTask = _g.sent();
                                return [3 /*break*/, 8];
                            case 4:
                                if (!(change.type === "edit" && change.task.id)) return [3 /*break*/, 6];
                                updateData = {};
                                if (change.task.title !== undefined)
                                    updateData.title = change.task.title;
                                if (change.task.estimatedMinutes !== undefined)
                                    updateData.estimatedMinutes = change.task.estimatedMinutes;
                                if (change.task.priority !== undefined)
                                    updateData.priority = change.task.priority;
                                if (change.task.status !== undefined)
                                    updateData.status = change.task.status;
                                if (change.task.scheduledDate !== undefined)
                                    updateData.scheduledDate = change.task.scheduledDate;
                                return [4 /*yield*/, tx.studyTask.update({
                                        where: { id: change.task.id },
                                        data: updateData,
                                    })];
                            case 5:
                                updatedTask = _g.sent();
                                return [3 /*break*/, 8];
                            case 6:
                                if (!(change.type === "delete" && change.task.id)) return [3 /*break*/, 8];
                                return [4 /*yield*/, tx.studyTask.delete({
                                        where: { id: change.task.id },
                                    })];
                            case 7:
                                updatedTask = _g.sent();
                                _g.label = 8;
                            case 8: return [2 /*return*/, {
                                    success: true,
                                    task: updatedTask,
                                }];
                        }
                    });
                }); }, {
                    isolationLevel: 'Serializable', // Use Serializable to prevent phantom reads (e.g. concurrent inserts)
                })];
        });
    });
}
