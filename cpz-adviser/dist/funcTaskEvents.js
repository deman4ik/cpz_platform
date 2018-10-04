require("source-map-support").install();
module.exports =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// eslint-disable-next-line no-unused-vars
/******/ 	function hotDownloadUpdateChunk(chunkId) {
/******/ 		var chunk = require("./" + "" + chunkId + "." + hotCurrentHash + ".hot-update.js");
/******/ 		hotAddUpdateChunk(chunk.id, chunk.modules);
/******/ 	}
/******/
/******/ 	// eslint-disable-next-line no-unused-vars
/******/ 	function hotDownloadManifest() {
/******/ 		try {
/******/ 			var update = require("./" + "" + hotCurrentHash + ".hot-update.json");
/******/ 		} catch (e) {
/******/ 			return Promise.resolve();
/******/ 		}
/******/ 		return Promise.resolve(update);
/******/ 	}
/******/
/******/ 	//eslint-disable-next-line no-unused-vars
/******/ 	function hotDisposeChunk(chunkId) {
/******/ 		delete installedChunks[chunkId];
/******/ 	}
/******/
/******/ 	var hotApplyOnUpdate = true;
/******/ 	// eslint-disable-next-line no-unused-vars
/******/ 	var hotCurrentHash = "fb20aee623b140d08490";
/******/ 	var hotRequestTimeout = 10000;
/******/ 	var hotCurrentModuleData = {};
/******/ 	var hotCurrentChildModule;
/******/ 	// eslint-disable-next-line no-unused-vars
/******/ 	var hotCurrentParents = [];
/******/ 	// eslint-disable-next-line no-unused-vars
/******/ 	var hotCurrentParentsTemp = [];
/******/
/******/ 	// eslint-disable-next-line no-unused-vars
/******/ 	function hotCreateRequire(moduleId) {
/******/ 		var me = installedModules[moduleId];
/******/ 		if (!me) return __webpack_require__;
/******/ 		var fn = function(request) {
/******/ 			if (me.hot.active) {
/******/ 				if (installedModules[request]) {
/******/ 					if (installedModules[request].parents.indexOf(moduleId) === -1) {
/******/ 						installedModules[request].parents.push(moduleId);
/******/ 					}
/******/ 				} else {
/******/ 					hotCurrentParents = [moduleId];
/******/ 					hotCurrentChildModule = request;
/******/ 				}
/******/ 				if (me.children.indexOf(request) === -1) {
/******/ 					me.children.push(request);
/******/ 				}
/******/ 			} else {
/******/ 				console.warn(
/******/ 					"[HMR] unexpected require(" +
/******/ 						request +
/******/ 						") from disposed module " +
/******/ 						moduleId
/******/ 				);
/******/ 				hotCurrentParents = [];
/******/ 			}
/******/ 			return __webpack_require__(request);
/******/ 		};
/******/ 		var ObjectFactory = function ObjectFactory(name) {
/******/ 			return {
/******/ 				configurable: true,
/******/ 				enumerable: true,
/******/ 				get: function() {
/******/ 					return __webpack_require__[name];
/******/ 				},
/******/ 				set: function(value) {
/******/ 					__webpack_require__[name] = value;
/******/ 				}
/******/ 			};
/******/ 		};
/******/ 		for (var name in __webpack_require__) {
/******/ 			if (
/******/ 				Object.prototype.hasOwnProperty.call(__webpack_require__, name) &&
/******/ 				name !== "e" &&
/******/ 				name !== "t"
/******/ 			) {
/******/ 				Object.defineProperty(fn, name, ObjectFactory(name));
/******/ 			}
/******/ 		}
/******/ 		fn.e = function(chunkId) {
/******/ 			if (hotStatus === "ready") hotSetStatus("prepare");
/******/ 			hotChunksLoading++;
/******/ 			return __webpack_require__.e(chunkId).then(finishChunkLoading, function(err) {
/******/ 				finishChunkLoading();
/******/ 				throw err;
/******/ 			});
/******/
/******/ 			function finishChunkLoading() {
/******/ 				hotChunksLoading--;
/******/ 				if (hotStatus === "prepare") {
/******/ 					if (!hotWaitingFilesMap[chunkId]) {
/******/ 						hotEnsureUpdateChunk(chunkId);
/******/ 					}
/******/ 					if (hotChunksLoading === 0 && hotWaitingFiles === 0) {
/******/ 						hotUpdateDownloaded();
/******/ 					}
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 		fn.t = function(value, mode) {
/******/ 			if (mode & 1) value = fn(value);
/******/ 			return __webpack_require__.t(value, mode & ~1);
/******/ 		};
/******/ 		return fn;
/******/ 	}
/******/
/******/ 	// eslint-disable-next-line no-unused-vars
/******/ 	function hotCreateModule(moduleId) {
/******/ 		var hot = {
/******/ 			// private stuff
/******/ 			_acceptedDependencies: {},
/******/ 			_declinedDependencies: {},
/******/ 			_selfAccepted: false,
/******/ 			_selfDeclined: false,
/******/ 			_disposeHandlers: [],
/******/ 			_main: hotCurrentChildModule !== moduleId,
/******/
/******/ 			// Module API
/******/ 			active: true,
/******/ 			accept: function(dep, callback) {
/******/ 				if (dep === undefined) hot._selfAccepted = true;
/******/ 				else if (typeof dep === "function") hot._selfAccepted = dep;
/******/ 				else if (typeof dep === "object")
/******/ 					for (var i = 0; i < dep.length; i++)
/******/ 						hot._acceptedDependencies[dep[i]] = callback || function() {};
/******/ 				else hot._acceptedDependencies[dep] = callback || function() {};
/******/ 			},
/******/ 			decline: function(dep) {
/******/ 				if (dep === undefined) hot._selfDeclined = true;
/******/ 				else if (typeof dep === "object")
/******/ 					for (var i = 0; i < dep.length; i++)
/******/ 						hot._declinedDependencies[dep[i]] = true;
/******/ 				else hot._declinedDependencies[dep] = true;
/******/ 			},
/******/ 			dispose: function(callback) {
/******/ 				hot._disposeHandlers.push(callback);
/******/ 			},
/******/ 			addDisposeHandler: function(callback) {
/******/ 				hot._disposeHandlers.push(callback);
/******/ 			},
/******/ 			removeDisposeHandler: function(callback) {
/******/ 				var idx = hot._disposeHandlers.indexOf(callback);
/******/ 				if (idx >= 0) hot._disposeHandlers.splice(idx, 1);
/******/ 			},
/******/
/******/ 			// Management API
/******/ 			check: hotCheck,
/******/ 			apply: hotApply,
/******/ 			status: function(l) {
/******/ 				if (!l) return hotStatus;
/******/ 				hotStatusHandlers.push(l);
/******/ 			},
/******/ 			addStatusHandler: function(l) {
/******/ 				hotStatusHandlers.push(l);
/******/ 			},
/******/ 			removeStatusHandler: function(l) {
/******/ 				var idx = hotStatusHandlers.indexOf(l);
/******/ 				if (idx >= 0) hotStatusHandlers.splice(idx, 1);
/******/ 			},
/******/
/******/ 			//inherit from previous dispose call
/******/ 			data: hotCurrentModuleData[moduleId]
/******/ 		};
/******/ 		hotCurrentChildModule = undefined;
/******/ 		return hot;
/******/ 	}
/******/
/******/ 	var hotStatusHandlers = [];
/******/ 	var hotStatus = "idle";
/******/
/******/ 	function hotSetStatus(newStatus) {
/******/ 		hotStatus = newStatus;
/******/ 		for (var i = 0; i < hotStatusHandlers.length; i++)
/******/ 			hotStatusHandlers[i].call(null, newStatus);
/******/ 	}
/******/
/******/ 	// while downloading
/******/ 	var hotWaitingFiles = 0;
/******/ 	var hotChunksLoading = 0;
/******/ 	var hotWaitingFilesMap = {};
/******/ 	var hotRequestedFilesMap = {};
/******/ 	var hotAvailableFilesMap = {};
/******/ 	var hotDeferred;
/******/
/******/ 	// The update info
/******/ 	var hotUpdate, hotUpdateNewHash;
/******/
/******/ 	function toModuleId(id) {
/******/ 		var isNumber = +id + "" === id;
/******/ 		return isNumber ? +id : id;
/******/ 	}
/******/
/******/ 	function hotCheck(apply) {
/******/ 		if (hotStatus !== "idle") {
/******/ 			throw new Error("check() is only allowed in idle status");
/******/ 		}
/******/ 		hotApplyOnUpdate = apply;
/******/ 		hotSetStatus("check");
/******/ 		return hotDownloadManifest(hotRequestTimeout).then(function(update) {
/******/ 			if (!update) {
/******/ 				hotSetStatus("idle");
/******/ 				return null;
/******/ 			}
/******/ 			hotRequestedFilesMap = {};
/******/ 			hotWaitingFilesMap = {};
/******/ 			hotAvailableFilesMap = update.c;
/******/ 			hotUpdateNewHash = update.h;
/******/
/******/ 			hotSetStatus("prepare");
/******/ 			var promise = new Promise(function(resolve, reject) {
/******/ 				hotDeferred = {
/******/ 					resolve: resolve,
/******/ 					reject: reject
/******/ 				};
/******/ 			});
/******/ 			hotUpdate = {};
/******/ 			var chunkId = "funcTaskEvents";
/******/ 			// eslint-disable-next-line no-lone-blocks
/******/ 			{
/******/ 				/*globals chunkId */
/******/ 				hotEnsureUpdateChunk(chunkId);
/******/ 			}
/******/ 			if (
/******/ 				hotStatus === "prepare" &&
/******/ 				hotChunksLoading === 0 &&
/******/ 				hotWaitingFiles === 0
/******/ 			) {
/******/ 				hotUpdateDownloaded();
/******/ 			}
/******/ 			return promise;
/******/ 		});
/******/ 	}
/******/
/******/ 	// eslint-disable-next-line no-unused-vars
/******/ 	function hotAddUpdateChunk(chunkId, moreModules) {
/******/ 		if (!hotAvailableFilesMap[chunkId] || !hotRequestedFilesMap[chunkId])
/******/ 			return;
/******/ 		hotRequestedFilesMap[chunkId] = false;
/******/ 		for (var moduleId in moreModules) {
/******/ 			if (Object.prototype.hasOwnProperty.call(moreModules, moduleId)) {
/******/ 				hotUpdate[moduleId] = moreModules[moduleId];
/******/ 			}
/******/ 		}
/******/ 		if (--hotWaitingFiles === 0 && hotChunksLoading === 0) {
/******/ 			hotUpdateDownloaded();
/******/ 		}
/******/ 	}
/******/
/******/ 	function hotEnsureUpdateChunk(chunkId) {
/******/ 		if (!hotAvailableFilesMap[chunkId]) {
/******/ 			hotWaitingFilesMap[chunkId] = true;
/******/ 		} else {
/******/ 			hotRequestedFilesMap[chunkId] = true;
/******/ 			hotWaitingFiles++;
/******/ 			hotDownloadUpdateChunk(chunkId);
/******/ 		}
/******/ 	}
/******/
/******/ 	function hotUpdateDownloaded() {
/******/ 		hotSetStatus("ready");
/******/ 		var deferred = hotDeferred;
/******/ 		hotDeferred = null;
/******/ 		if (!deferred) return;
/******/ 		if (hotApplyOnUpdate) {
/******/ 			// Wrap deferred object in Promise to mark it as a well-handled Promise to
/******/ 			// avoid triggering uncaught exception warning in Chrome.
/******/ 			// See https://bugs.chromium.org/p/chromium/issues/detail?id=465666
/******/ 			Promise.resolve()
/******/ 				.then(function() {
/******/ 					return hotApply(hotApplyOnUpdate);
/******/ 				})
/******/ 				.then(
/******/ 					function(result) {
/******/ 						deferred.resolve(result);
/******/ 					},
/******/ 					function(err) {
/******/ 						deferred.reject(err);
/******/ 					}
/******/ 				);
/******/ 		} else {
/******/ 			var outdatedModules = [];
/******/ 			for (var id in hotUpdate) {
/******/ 				if (Object.prototype.hasOwnProperty.call(hotUpdate, id)) {
/******/ 					outdatedModules.push(toModuleId(id));
/******/ 				}
/******/ 			}
/******/ 			deferred.resolve(outdatedModules);
/******/ 		}
/******/ 	}
/******/
/******/ 	function hotApply(options) {
/******/ 		if (hotStatus !== "ready")
/******/ 			throw new Error("apply() is only allowed in ready status");
/******/ 		options = options || {};
/******/
/******/ 		var cb;
/******/ 		var i;
/******/ 		var j;
/******/ 		var module;
/******/ 		var moduleId;
/******/
/******/ 		function getAffectedStuff(updateModuleId) {
/******/ 			var outdatedModules = [updateModuleId];
/******/ 			var outdatedDependencies = {};
/******/
/******/ 			var queue = outdatedModules.slice().map(function(id) {
/******/ 				return {
/******/ 					chain: [id],
/******/ 					id: id
/******/ 				};
/******/ 			});
/******/ 			while (queue.length > 0) {
/******/ 				var queueItem = queue.pop();
/******/ 				var moduleId = queueItem.id;
/******/ 				var chain = queueItem.chain;
/******/ 				module = installedModules[moduleId];
/******/ 				if (!module || module.hot._selfAccepted) continue;
/******/ 				if (module.hot._selfDeclined) {
/******/ 					return {
/******/ 						type: "self-declined",
/******/ 						chain: chain,
/******/ 						moduleId: moduleId
/******/ 					};
/******/ 				}
/******/ 				if (module.hot._main) {
/******/ 					return {
/******/ 						type: "unaccepted",
/******/ 						chain: chain,
/******/ 						moduleId: moduleId
/******/ 					};
/******/ 				}
/******/ 				for (var i = 0; i < module.parents.length; i++) {
/******/ 					var parentId = module.parents[i];
/******/ 					var parent = installedModules[parentId];
/******/ 					if (!parent) continue;
/******/ 					if (parent.hot._declinedDependencies[moduleId]) {
/******/ 						return {
/******/ 							type: "declined",
/******/ 							chain: chain.concat([parentId]),
/******/ 							moduleId: moduleId,
/******/ 							parentId: parentId
/******/ 						};
/******/ 					}
/******/ 					if (outdatedModules.indexOf(parentId) !== -1) continue;
/******/ 					if (parent.hot._acceptedDependencies[moduleId]) {
/******/ 						if (!outdatedDependencies[parentId])
/******/ 							outdatedDependencies[parentId] = [];
/******/ 						addAllToSet(outdatedDependencies[parentId], [moduleId]);
/******/ 						continue;
/******/ 					}
/******/ 					delete outdatedDependencies[parentId];
/******/ 					outdatedModules.push(parentId);
/******/ 					queue.push({
/******/ 						chain: chain.concat([parentId]),
/******/ 						id: parentId
/******/ 					});
/******/ 				}
/******/ 			}
/******/
/******/ 			return {
/******/ 				type: "accepted",
/******/ 				moduleId: updateModuleId,
/******/ 				outdatedModules: outdatedModules,
/******/ 				outdatedDependencies: outdatedDependencies
/******/ 			};
/******/ 		}
/******/
/******/ 		function addAllToSet(a, b) {
/******/ 			for (var i = 0; i < b.length; i++) {
/******/ 				var item = b[i];
/******/ 				if (a.indexOf(item) === -1) a.push(item);
/******/ 			}
/******/ 		}
/******/
/******/ 		// at begin all updates modules are outdated
/******/ 		// the "outdated" status can propagate to parents if they don't accept the children
/******/ 		var outdatedDependencies = {};
/******/ 		var outdatedModules = [];
/******/ 		var appliedUpdate = {};
/******/
/******/ 		var warnUnexpectedRequire = function warnUnexpectedRequire() {
/******/ 			console.warn(
/******/ 				"[HMR] unexpected require(" + result.moduleId + ") to disposed module"
/******/ 			);
/******/ 		};
/******/
/******/ 		for (var id in hotUpdate) {
/******/ 			if (Object.prototype.hasOwnProperty.call(hotUpdate, id)) {
/******/ 				moduleId = toModuleId(id);
/******/ 				/** @type {TODO} */
/******/ 				var result;
/******/ 				if (hotUpdate[id]) {
/******/ 					result = getAffectedStuff(moduleId);
/******/ 				} else {
/******/ 					result = {
/******/ 						type: "disposed",
/******/ 						moduleId: id
/******/ 					};
/******/ 				}
/******/ 				/** @type {Error|false} */
/******/ 				var abortError = false;
/******/ 				var doApply = false;
/******/ 				var doDispose = false;
/******/ 				var chainInfo = "";
/******/ 				if (result.chain) {
/******/ 					chainInfo = "\nUpdate propagation: " + result.chain.join(" -> ");
/******/ 				}
/******/ 				switch (result.type) {
/******/ 					case "self-declined":
/******/ 						if (options.onDeclined) options.onDeclined(result);
/******/ 						if (!options.ignoreDeclined)
/******/ 							abortError = new Error(
/******/ 								"Aborted because of self decline: " +
/******/ 									result.moduleId +
/******/ 									chainInfo
/******/ 							);
/******/ 						break;
/******/ 					case "declined":
/******/ 						if (options.onDeclined) options.onDeclined(result);
/******/ 						if (!options.ignoreDeclined)
/******/ 							abortError = new Error(
/******/ 								"Aborted because of declined dependency: " +
/******/ 									result.moduleId +
/******/ 									" in " +
/******/ 									result.parentId +
/******/ 									chainInfo
/******/ 							);
/******/ 						break;
/******/ 					case "unaccepted":
/******/ 						if (options.onUnaccepted) options.onUnaccepted(result);
/******/ 						if (!options.ignoreUnaccepted)
/******/ 							abortError = new Error(
/******/ 								"Aborted because " + moduleId + " is not accepted" + chainInfo
/******/ 							);
/******/ 						break;
/******/ 					case "accepted":
/******/ 						if (options.onAccepted) options.onAccepted(result);
/******/ 						doApply = true;
/******/ 						break;
/******/ 					case "disposed":
/******/ 						if (options.onDisposed) options.onDisposed(result);
/******/ 						doDispose = true;
/******/ 						break;
/******/ 					default:
/******/ 						throw new Error("Unexception type " + result.type);
/******/ 				}
/******/ 				if (abortError) {
/******/ 					hotSetStatus("abort");
/******/ 					return Promise.reject(abortError);
/******/ 				}
/******/ 				if (doApply) {
/******/ 					appliedUpdate[moduleId] = hotUpdate[moduleId];
/******/ 					addAllToSet(outdatedModules, result.outdatedModules);
/******/ 					for (moduleId in result.outdatedDependencies) {
/******/ 						if (
/******/ 							Object.prototype.hasOwnProperty.call(
/******/ 								result.outdatedDependencies,
/******/ 								moduleId
/******/ 							)
/******/ 						) {
/******/ 							if (!outdatedDependencies[moduleId])
/******/ 								outdatedDependencies[moduleId] = [];
/******/ 							addAllToSet(
/******/ 								outdatedDependencies[moduleId],
/******/ 								result.outdatedDependencies[moduleId]
/******/ 							);
/******/ 						}
/******/ 					}
/******/ 				}
/******/ 				if (doDispose) {
/******/ 					addAllToSet(outdatedModules, [result.moduleId]);
/******/ 					appliedUpdate[moduleId] = warnUnexpectedRequire;
/******/ 				}
/******/ 			}
/******/ 		}
/******/
/******/ 		// Store self accepted outdated modules to require them later by the module system
/******/ 		var outdatedSelfAcceptedModules = [];
/******/ 		for (i = 0; i < outdatedModules.length; i++) {
/******/ 			moduleId = outdatedModules[i];
/******/ 			if (
/******/ 				installedModules[moduleId] &&
/******/ 				installedModules[moduleId].hot._selfAccepted
/******/ 			)
/******/ 				outdatedSelfAcceptedModules.push({
/******/ 					module: moduleId,
/******/ 					errorHandler: installedModules[moduleId].hot._selfAccepted
/******/ 				});
/******/ 		}
/******/
/******/ 		// Now in "dispose" phase
/******/ 		hotSetStatus("dispose");
/******/ 		Object.keys(hotAvailableFilesMap).forEach(function(chunkId) {
/******/ 			if (hotAvailableFilesMap[chunkId] === false) {
/******/ 				hotDisposeChunk(chunkId);
/******/ 			}
/******/ 		});
/******/
/******/ 		var idx;
/******/ 		var queue = outdatedModules.slice();
/******/ 		while (queue.length > 0) {
/******/ 			moduleId = queue.pop();
/******/ 			module = installedModules[moduleId];
/******/ 			if (!module) continue;
/******/
/******/ 			var data = {};
/******/
/******/ 			// Call dispose handlers
/******/ 			var disposeHandlers = module.hot._disposeHandlers;
/******/ 			for (j = 0; j < disposeHandlers.length; j++) {
/******/ 				cb = disposeHandlers[j];
/******/ 				cb(data);
/******/ 			}
/******/ 			hotCurrentModuleData[moduleId] = data;
/******/
/******/ 			// disable module (this disables requires from this module)
/******/ 			module.hot.active = false;
/******/
/******/ 			// remove module from cache
/******/ 			delete installedModules[moduleId];
/******/
/******/ 			// when disposing there is no need to call dispose handler
/******/ 			delete outdatedDependencies[moduleId];
/******/
/******/ 			// remove "parents" references from all children
/******/ 			for (j = 0; j < module.children.length; j++) {
/******/ 				var child = installedModules[module.children[j]];
/******/ 				if (!child) continue;
/******/ 				idx = child.parents.indexOf(moduleId);
/******/ 				if (idx >= 0) {
/******/ 					child.parents.splice(idx, 1);
/******/ 				}
/******/ 			}
/******/ 		}
/******/
/******/ 		// remove outdated dependency from module children
/******/ 		var dependency;
/******/ 		var moduleOutdatedDependencies;
/******/ 		for (moduleId in outdatedDependencies) {
/******/ 			if (
/******/ 				Object.prototype.hasOwnProperty.call(outdatedDependencies, moduleId)
/******/ 			) {
/******/ 				module = installedModules[moduleId];
/******/ 				if (module) {
/******/ 					moduleOutdatedDependencies = outdatedDependencies[moduleId];
/******/ 					for (j = 0; j < moduleOutdatedDependencies.length; j++) {
/******/ 						dependency = moduleOutdatedDependencies[j];
/******/ 						idx = module.children.indexOf(dependency);
/******/ 						if (idx >= 0) module.children.splice(idx, 1);
/******/ 					}
/******/ 				}
/******/ 			}
/******/ 		}
/******/
/******/ 		// Not in "apply" phase
/******/ 		hotSetStatus("apply");
/******/
/******/ 		hotCurrentHash = hotUpdateNewHash;
/******/
/******/ 		// insert new code
/******/ 		for (moduleId in appliedUpdate) {
/******/ 			if (Object.prototype.hasOwnProperty.call(appliedUpdate, moduleId)) {
/******/ 				modules[moduleId] = appliedUpdate[moduleId];
/******/ 			}
/******/ 		}
/******/
/******/ 		// call accept handlers
/******/ 		var error = null;
/******/ 		for (moduleId in outdatedDependencies) {
/******/ 			if (
/******/ 				Object.prototype.hasOwnProperty.call(outdatedDependencies, moduleId)
/******/ 			) {
/******/ 				module = installedModules[moduleId];
/******/ 				if (module) {
/******/ 					moduleOutdatedDependencies = outdatedDependencies[moduleId];
/******/ 					var callbacks = [];
/******/ 					for (i = 0; i < moduleOutdatedDependencies.length; i++) {
/******/ 						dependency = moduleOutdatedDependencies[i];
/******/ 						cb = module.hot._acceptedDependencies[dependency];
/******/ 						if (cb) {
/******/ 							if (callbacks.indexOf(cb) !== -1) continue;
/******/ 							callbacks.push(cb);
/******/ 						}
/******/ 					}
/******/ 					for (i = 0; i < callbacks.length; i++) {
/******/ 						cb = callbacks[i];
/******/ 						try {
/******/ 							cb(moduleOutdatedDependencies);
/******/ 						} catch (err) {
/******/ 							if (options.onErrored) {
/******/ 								options.onErrored({
/******/ 									type: "accept-errored",
/******/ 									moduleId: moduleId,
/******/ 									dependencyId: moduleOutdatedDependencies[i],
/******/ 									error: err
/******/ 								});
/******/ 							}
/******/ 							if (!options.ignoreErrored) {
/******/ 								if (!error) error = err;
/******/ 							}
/******/ 						}
/******/ 					}
/******/ 				}
/******/ 			}
/******/ 		}
/******/
/******/ 		// Load self accepted modules
/******/ 		for (i = 0; i < outdatedSelfAcceptedModules.length; i++) {
/******/ 			var item = outdatedSelfAcceptedModules[i];
/******/ 			moduleId = item.module;
/******/ 			hotCurrentParents = [moduleId];
/******/ 			try {
/******/ 				__webpack_require__(moduleId);
/******/ 			} catch (err) {
/******/ 				if (typeof item.errorHandler === "function") {
/******/ 					try {
/******/ 						item.errorHandler(err);
/******/ 					} catch (err2) {
/******/ 						if (options.onErrored) {
/******/ 							options.onErrored({
/******/ 								type: "self-accept-error-handler-errored",
/******/ 								moduleId: moduleId,
/******/ 								error: err2,
/******/ 								originalError: err
/******/ 							});
/******/ 						}
/******/ 						if (!options.ignoreErrored) {
/******/ 							if (!error) error = err2;
/******/ 						}
/******/ 						if (!error) error = err;
/******/ 					}
/******/ 				} else {
/******/ 					if (options.onErrored) {
/******/ 						options.onErrored({
/******/ 							type: "self-accept-errored",
/******/ 							moduleId: moduleId,
/******/ 							error: err
/******/ 						});
/******/ 					}
/******/ 					if (!options.ignoreErrored) {
/******/ 						if (!error) error = err;
/******/ 					}
/******/ 				}
/******/ 			}
/******/ 		}
/******/
/******/ 		// handle errors in accept handlers and self accepted module load
/******/ 		if (error) {
/******/ 			hotSetStatus("fail");
/******/ 			return Promise.reject(error);
/******/ 		}
/******/
/******/ 		hotSetStatus("idle");
/******/ 		return new Promise(function(resolve) {
/******/ 			resolve(outdatedModules);
/******/ 		});
/******/ 	}
/******/
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {},
/******/ 			hot: hotCreateModule(moduleId),
/******/ 			parents: (hotCurrentParentsTemp = hotCurrentParents, hotCurrentParents = [], hotCurrentParentsTemp),
/******/ 			children: []
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, hotCreateRequire(moduleId));
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// __webpack_hash__
/******/ 	__webpack_require__.h = function() { return hotCurrentHash; };
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return hotCreateRequire("./src/funcs/funcTaskEvents.js")(__webpack_require__.s = "./src/funcs/funcTaskEvents.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "../cpz-shared/config/defaults/index.js":
/*!**********************************************!*\
  !*** ../cpz-shared/config/defaults/index.js ***!
  \**********************************************/
/*! exports provided: REQUIRED_HISTORY_MAX_BARS */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "REQUIRED_HISTORY_MAX_BARS", function() { return REQUIRED_HISTORY_MAX_BARS; });
var REQUIRED_HISTORY_MAX_BARS = 100; // Максимальное количество баров в кэше ("Candles" Azure Storage Table)



/***/ }),

/***/ "../cpz-shared/config/eventTypes/candles.js":
/*!**************************************************!*\
  !*** ../cpz-shared/config/eventTypes/candles.js ***!
  \**************************************************/
/*! exports provided: CANDLES_HANDLED_EVENT, CANDLES_NEWCANDLE_EVENT */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "CANDLES_HANDLED_EVENT", function() { return CANDLES_HANDLED_EVENT; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "CANDLES_NEWCANDLE_EVENT", function() { return CANDLES_NEWCANDLE_EVENT; });
var CANDLES_NEWCANDLE_EVENT = {
  eventType: "CPZ.Candles.NewCandle",
  dataSchema: {
    candleId: {
      description: "Uniq Candle Id.",
      type: "string",
      empty: false
    },
    exchange: {
      description: "Exchange code.",
      type: "string",
      empty: false
    },
    asset: {
      description: "Base currency.",
      type: "string",
      empty: false
    },
    currency: {
      description: "Quote currency.",
      type: "string",
      empty: false
    },
    timeframe: {
      description: "Timeframe in minutes.",
      type: "number"
    },
    time: {
      description: "Candle time in seconds.",
      type: "number"
    },
    open: {
      description: "Candle Open Price.",
      type: "number"
    },
    close: {
      description: "Candle Close Price.",
      type: "number"
    },
    high: {
      description: "Candle Highest Price.",
      type: "number"
    },
    low: {
      description: "Trade Lowest Price.",
      type: "number"
    },
    volume: {
      description: "Candle Volume.",
      type: "number"
    }
  }
};
var CANDLES_HANDLED_EVENT = {
  eventType: "CPZ.Candles.Handled",
  dataSchema: {
    candleId: {
      description: "Uniq Candle Id.",
      type: "string",
      empty: false
    },
    service: {
      description: "Sevice name handeling event",
      type: "string",
      values: ["adviser", "trader"]
    },
    success: {
      description: "Success execution list",
      type: "array",
      items: "string"
    },
    error: {
      description: "Error execution list",
      type: "array",
      items: {
        type: "object",
        props: {
          taskId: {
            type: "string",
            empty: false
          },
          error: {
            type: "object",
            description: "Error object if something goes wrong.",
            props: {
              code: {
                description: "Error code.",
                type: "string",
                empty: false
              },
              message: {
                description: "Error message.",
                type: "string",
                empty: false
              },
              detail: {
                description: "Error detail.",
                type: "string",
                optional: true,
                empty: false
              }
            },
            optional: true
          }
        }
      }
    }
  },
  successPending: {
    description: "Success queued list",
    type: "array",
    items: "string"
  },
  errorPending: {
    description: "Error queued list",
    type: "array",
    items: {
      type: "object",
      props: {
        taskId: {
          type: "string",
          empty: false
        },
        error: {
          type: "object",
          description: "Error object if something goes wrong.",
          props: {
            code: {
              description: "Error code.",
              type: "string",
              empty: false
            },
            message: {
              description: "Error message.",
              type: "string",
              empty: false
            },
            detail: {
              description: "Error detail.",
              type: "string",
              optional: true,
              empty: false
            }
          },
          optional: true
        }
      }
    }
  }
};


/***/ }),

/***/ "../cpz-shared/config/eventTypes/events.js":
/*!*************************************************!*\
  !*** ../cpz-shared/config/eventTypes/events.js ***!
  \*************************************************/
/*! exports provided: BASE_EVENT, SUB_VALIDATION_EVENT, LOG_ADVISER_EVENT, LOG_CANDLEBATCHER_EVENT, LOG_MARKETWATCHER_EVENT, LOG_TRADER_EVENT, ERROR_ADVISER_EVENT, ERROR_CANDLEBATCHER_EVENT, ERROR_MARKETWATCHER_EVENT, ERROR_TRADER_EVENT */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "BASE_EVENT", function() { return BASE_EVENT; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "SUB_VALIDATION_EVENT", function() { return SUB_VALIDATION_EVENT; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "LOG_ADVISER_EVENT", function() { return LOG_ADVISER_EVENT; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "LOG_CANDLEBATCHER_EVENT", function() { return LOG_CANDLEBATCHER_EVENT; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "LOG_MARKETWATCHER_EVENT", function() { return LOG_MARKETWATCHER_EVENT; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "LOG_TRADER_EVENT", function() { return LOG_TRADER_EVENT; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ERROR_ADVISER_EVENT", function() { return ERROR_ADVISER_EVENT; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ERROR_CANDLEBATCHER_EVENT", function() { return ERROR_CANDLEBATCHER_EVENT; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ERROR_MARKETWATCHER_EVENT", function() { return ERROR_MARKETWATCHER_EVENT; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ERROR_TRADER_EVENT", function() { return ERROR_TRADER_EVENT; });
var BASE_EVENT = {
  id: {
    description: "An unique identifier for the event.",
    type: "string",
    empty: false
  },
  topic: {
    description: "The resource path of the event source.",
    type: "string",
    empty: false
  },
  subject: {
    description: "A resource path relative to the topic path.",
    type: "string",
    empty: false
  },
  data: {
    description: "Event data specific to the event type.",
    type: "object",
    empty: false
  },
  eventType: {
    description: "The type of the event that occurred.",
    type: "string",
    empty: false
  },
  eventTime: {
    description: "The time (in UTC) the event was generated.",
    format: "date-time",
    type: "string",
    empty: false
  },
  metadataVersion: {
    description: "The schema version of the event metadata.",
    readOnly: true,
    type: "string",
    empty: false
  },
  dataVersion: {
    description: "The schema version of the data object.",
    type: "string",
    empty: false
  }
};
var SUB_VALIDATION_EVENT = {
  eventType: "Microsoft.EventGrid.SubscriptionValidationEvent"
};
var LOG_MARKETWATCHER_EVENT = {
  eventType: "CPZ.MarketWatcher.Log"
};
var LOG_CANDLEBATCHER_EVENT = {
  eventType: "CPZ.Candlebatcher.Log"
};
var LOG_ADVISER_EVENT = {
  eventType: "CPZ.Adviser.Log"
};
var LOG_TRADER_EVENT = {
  eventType: "CPZ.Trader.Log"
};
var ERROR_MARKETWATCHER_EVENT = {
  eventType: "CPZ.MarketWatcher.Error"
};
var ERROR_CANDLEBATCHER_EVENT = {
  eventType: "CPZ.Candlebatcher.Error"
};
var ERROR_ADVISER_EVENT = {
  eventType: "CPZ.Adviser.Error"
};
var ERROR_TRADER_EVENT = {
  eventType: "CPZ.Trader.Error"
};


/***/ }),

/***/ "../cpz-shared/config/eventTypes/index.js":
/*!************************************************!*\
  !*** ../cpz-shared/config/eventTypes/index.js ***!
  \************************************************/
/*! exports provided: CANDLES_HANDLED_EVENT, CANDLES_NEWCANDLE_EVENT, BASE_EVENT, SUB_VALIDATION_EVENT, LOG_ADVISER_EVENT, LOG_CANDLEBATCHER_EVENT, LOG_MARKETWATCHER_EVENT, LOG_TRADER_EVENT, ERROR_ADVISER_EVENT, ERROR_CANDLEBATCHER_EVENT, ERROR_MARKETWATCHER_EVENT, ERROR_TRADER_EVENT, SIGNALS_HANDLED_EVENT, SIGNALS_NEWSIGNAL_EVENT, TASKS_MARKETWATCHER_START_EVENT, TASKS_MARKETWATCHER_STARTED_EVENT, TASKS_MARKETWATCHER_STOP_EVENT, TASKS_MARKETWATCHER_STOPPED_EVENT, TASKS_MARKETWATCHER_SUBSCRIBE_EVENT, TASKS_MARKETWATCHER_SUBSCRIBED_EVENT, TASKS_MARKETWATCHER_UNSUBSCRIBE_EVENT, TASKS_MARKETWATCHER_UNSUBSCRIBED_EVENT, TASKS_CANDLEBATCHER_START_EVENT, TASKS_CANDLEBATCHER_STARTED_EVENT, TASKS_CANDLEBATCHER_STOP_EVENT, TASKS_CANDLEBATCHER_STOPPED_EVENT, TASKS_CANDLEBATCHER_UPDATE_EVENT, TASKS_CANDLEBATCHER_UPDATED_EVENT, TASKS_ADVISER_START_EVENT, TASKS_ADVISER_STARTED_EVENT, TASKS_ADVISER_STOP_EVENT, TASKS_ADVISER_STOPPED_EVENT, TASKS_ADVISER_UPDATE_EVENT, TASKS_ADVISER_UPDATED_EVENT, TASKS_TRADER_START_EVENT, TASKS_TRADER_STARTED_EVENT, TASKS_TRADER_STOP_EVENT, TASKS_TRADER_STOPPED_EVENT, TASKS_TRADER_UPDATE_EVENT, TASKS_TRADER_UPDATED_EVENT, TICKS_NEWTICK_EVENT, TICKS_HANDLED_EVENT */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _candles__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./candles */ "../cpz-shared/config/eventTypes/candles.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "CANDLES_HANDLED_EVENT", function() { return _candles__WEBPACK_IMPORTED_MODULE_0__["CANDLES_HANDLED_EVENT"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "CANDLES_NEWCANDLE_EVENT", function() { return _candles__WEBPACK_IMPORTED_MODULE_0__["CANDLES_NEWCANDLE_EVENT"]; });

/* harmony import */ var _events__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./events */ "../cpz-shared/config/eventTypes/events.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "BASE_EVENT", function() { return _events__WEBPACK_IMPORTED_MODULE_1__["BASE_EVENT"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "SUB_VALIDATION_EVENT", function() { return _events__WEBPACK_IMPORTED_MODULE_1__["SUB_VALIDATION_EVENT"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "LOG_ADVISER_EVENT", function() { return _events__WEBPACK_IMPORTED_MODULE_1__["LOG_ADVISER_EVENT"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "LOG_CANDLEBATCHER_EVENT", function() { return _events__WEBPACK_IMPORTED_MODULE_1__["LOG_CANDLEBATCHER_EVENT"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "LOG_MARKETWATCHER_EVENT", function() { return _events__WEBPACK_IMPORTED_MODULE_1__["LOG_MARKETWATCHER_EVENT"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "LOG_TRADER_EVENT", function() { return _events__WEBPACK_IMPORTED_MODULE_1__["LOG_TRADER_EVENT"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "ERROR_ADVISER_EVENT", function() { return _events__WEBPACK_IMPORTED_MODULE_1__["ERROR_ADVISER_EVENT"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "ERROR_CANDLEBATCHER_EVENT", function() { return _events__WEBPACK_IMPORTED_MODULE_1__["ERROR_CANDLEBATCHER_EVENT"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "ERROR_MARKETWATCHER_EVENT", function() { return _events__WEBPACK_IMPORTED_MODULE_1__["ERROR_MARKETWATCHER_EVENT"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "ERROR_TRADER_EVENT", function() { return _events__WEBPACK_IMPORTED_MODULE_1__["ERROR_TRADER_EVENT"]; });

/* harmony import */ var _signals__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./signals */ "../cpz-shared/config/eventTypes/signals.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "SIGNALS_HANDLED_EVENT", function() { return _signals__WEBPACK_IMPORTED_MODULE_2__["SIGNALS_HANDLED_EVENT"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "SIGNALS_NEWSIGNAL_EVENT", function() { return _signals__WEBPACK_IMPORTED_MODULE_2__["SIGNALS_NEWSIGNAL_EVENT"]; });

/* harmony import */ var _tasks__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./tasks */ "../cpz-shared/config/eventTypes/tasks.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "TASKS_MARKETWATCHER_START_EVENT", function() { return _tasks__WEBPACK_IMPORTED_MODULE_3__["TASKS_MARKETWATCHER_START_EVENT"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "TASKS_MARKETWATCHER_STARTED_EVENT", function() { return _tasks__WEBPACK_IMPORTED_MODULE_3__["TASKS_MARKETWATCHER_STARTED_EVENT"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "TASKS_MARKETWATCHER_STOP_EVENT", function() { return _tasks__WEBPACK_IMPORTED_MODULE_3__["TASKS_MARKETWATCHER_STOP_EVENT"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "TASKS_MARKETWATCHER_STOPPED_EVENT", function() { return _tasks__WEBPACK_IMPORTED_MODULE_3__["TASKS_MARKETWATCHER_STOPPED_EVENT"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "TASKS_MARKETWATCHER_SUBSCRIBE_EVENT", function() { return _tasks__WEBPACK_IMPORTED_MODULE_3__["TASKS_MARKETWATCHER_SUBSCRIBE_EVENT"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "TASKS_MARKETWATCHER_SUBSCRIBED_EVENT", function() { return _tasks__WEBPACK_IMPORTED_MODULE_3__["TASKS_MARKETWATCHER_SUBSCRIBED_EVENT"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "TASKS_MARKETWATCHER_UNSUBSCRIBE_EVENT", function() { return _tasks__WEBPACK_IMPORTED_MODULE_3__["TASKS_MARKETWATCHER_UNSUBSCRIBE_EVENT"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "TASKS_MARKETWATCHER_UNSUBSCRIBED_EVENT", function() { return _tasks__WEBPACK_IMPORTED_MODULE_3__["TASKS_MARKETWATCHER_UNSUBSCRIBED_EVENT"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "TASKS_CANDLEBATCHER_START_EVENT", function() { return _tasks__WEBPACK_IMPORTED_MODULE_3__["TASKS_CANDLEBATCHER_START_EVENT"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "TASKS_CANDLEBATCHER_STARTED_EVENT", function() { return _tasks__WEBPACK_IMPORTED_MODULE_3__["TASKS_CANDLEBATCHER_STARTED_EVENT"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "TASKS_CANDLEBATCHER_STOP_EVENT", function() { return _tasks__WEBPACK_IMPORTED_MODULE_3__["TASKS_CANDLEBATCHER_STOP_EVENT"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "TASKS_CANDLEBATCHER_STOPPED_EVENT", function() { return _tasks__WEBPACK_IMPORTED_MODULE_3__["TASKS_CANDLEBATCHER_STOPPED_EVENT"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "TASKS_CANDLEBATCHER_UPDATE_EVENT", function() { return _tasks__WEBPACK_IMPORTED_MODULE_3__["TASKS_CANDLEBATCHER_UPDATE_EVENT"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "TASKS_CANDLEBATCHER_UPDATED_EVENT", function() { return _tasks__WEBPACK_IMPORTED_MODULE_3__["TASKS_CANDLEBATCHER_UPDATED_EVENT"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "TASKS_ADVISER_START_EVENT", function() { return _tasks__WEBPACK_IMPORTED_MODULE_3__["TASKS_ADVISER_START_EVENT"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "TASKS_ADVISER_STARTED_EVENT", function() { return _tasks__WEBPACK_IMPORTED_MODULE_3__["TASKS_ADVISER_STARTED_EVENT"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "TASKS_ADVISER_STOP_EVENT", function() { return _tasks__WEBPACK_IMPORTED_MODULE_3__["TASKS_ADVISER_STOP_EVENT"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "TASKS_ADVISER_STOPPED_EVENT", function() { return _tasks__WEBPACK_IMPORTED_MODULE_3__["TASKS_ADVISER_STOPPED_EVENT"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "TASKS_ADVISER_UPDATE_EVENT", function() { return _tasks__WEBPACK_IMPORTED_MODULE_3__["TASKS_ADVISER_UPDATE_EVENT"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "TASKS_ADVISER_UPDATED_EVENT", function() { return _tasks__WEBPACK_IMPORTED_MODULE_3__["TASKS_ADVISER_UPDATED_EVENT"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "TASKS_TRADER_START_EVENT", function() { return _tasks__WEBPACK_IMPORTED_MODULE_3__["TASKS_TRADER_START_EVENT"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "TASKS_TRADER_STARTED_EVENT", function() { return _tasks__WEBPACK_IMPORTED_MODULE_3__["TASKS_TRADER_STARTED_EVENT"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "TASKS_TRADER_STOP_EVENT", function() { return _tasks__WEBPACK_IMPORTED_MODULE_3__["TASKS_TRADER_STOP_EVENT"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "TASKS_TRADER_STOPPED_EVENT", function() { return _tasks__WEBPACK_IMPORTED_MODULE_3__["TASKS_TRADER_STOPPED_EVENT"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "TASKS_TRADER_UPDATE_EVENT", function() { return _tasks__WEBPACK_IMPORTED_MODULE_3__["TASKS_TRADER_UPDATE_EVENT"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "TASKS_TRADER_UPDATED_EVENT", function() { return _tasks__WEBPACK_IMPORTED_MODULE_3__["TASKS_TRADER_UPDATED_EVENT"]; });

/* harmony import */ var _ticks__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./ticks */ "../cpz-shared/config/eventTypes/ticks.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "TICKS_NEWTICK_EVENT", function() { return _ticks__WEBPACK_IMPORTED_MODULE_4__["TICKS_NEWTICK_EVENT"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "TICKS_HANDLED_EVENT", function() { return _ticks__WEBPACK_IMPORTED_MODULE_4__["TICKS_HANDLED_EVENT"]; });







/***/ }),

/***/ "../cpz-shared/config/eventTypes/signals.js":
/*!**************************************************!*\
  !*** ../cpz-shared/config/eventTypes/signals.js ***!
  \**************************************************/
/*! exports provided: SIGNALS_HANDLED_EVENT, SIGNALS_NEWSIGNAL_EVENT */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "SIGNALS_HANDLED_EVENT", function() { return SIGNALS_HANDLED_EVENT; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "SIGNALS_NEWSIGNAL_EVENT", function() { return SIGNALS_NEWSIGNAL_EVENT; });
var SIGNALS_NEWSIGNAL_EVENT = {
  eventType: "CPZ.Signals.NewSignal",
  subject: "{Exchange}/{Asset}/{Currency}/{Timeframe}/{RobotId}/{TaskId}.{B/E/R}",
  dataSchema: {
    signalId: {
      description: "Uniq Candle Id.",
      type: "string",
      empty: false
    },
    exchange: {
      description: "Exchange code.",
      type: "string",
      empty: false
    },
    asset: {
      description: "Base currency.",
      type: "string",
      empty: false
    },
    currency: {
      description: "Quote currency.",
      type: "string",
      empty: false
    },
    timeframe: {
      description: "Timeframe in minutes.",
      type: "number"
    },
    robotId: {
      description: "Robot uniq Id.",
      type: "string",
      empty: false
    },
    adviserId: {
      description: "Adviser task Id.",
      type: "string",
      empty: false
    },
    alertTime: {
      description: "Signal time in seconds.",
      type: "number"
    },
    action: {
      description: "Signal type.",
      type: "string",
      values: ["long", "closeLong", "short", "closeShort"]
    },
    qty: {
      description: "Volume.",
      type: "number",
      optional: true
    },
    orderType: {
      description: "Order type.",
      type: "string",
      values: ["stop", "limit", "market"],
      optional: true
    },
    price: {
      description: "Price in quote currency.",
      type: "number"
    },
    priceSource: {
      description: "Candle field.",
      type: "string",
      values: ["open", "close", "high", "low", "stop"]
    },
    positionId: {
      description: "Uniq position Id",
      type: "number"
    },
    candle: {
      description: "Signal from Candle.",
      type: "object",
      props: {
        time: {
          description: "Candle time in seconds.",
          type: "number"
        },
        open: {
          description: "Candle Open Price.",
          type: "number"
        },
        close: {
          description: "Candle Close Price.",
          type: "number"
        },
        high: {
          description: "Candle Highest Price.",
          type: "number"
        },
        low: {
          description: "Trade Lowest Price.",
          type: "number"
        },
        volume: {
          description: "Candle Volume.",
          type: "number"
        }
      },
      optional: true
    },
    settings: {
      description: "Trader parameters.",
      type: "object",
      props: {
        slippageStep: {
          description: "Price Slippage Step.",
          type: "number"
        },
        volume: {
          description: "User trade volume",
          type: "number"
        }
      },
      optional: true
    }
  }
};
var SIGNALS_HANDLED_EVENT = {
  eventType: "CPZ.Signals.Handled",
  dataSchema: {
    signalId: {
      description: "Uniq Signal Id.",
      type: "string",
      empty: false
    },
    service: {
      description: "Sevice name handeling event",
      type: "string",
      values: ["trader"]
    },
    successTraders: {
      description: "Success Traders execution list",
      type: "array",
      items: "string"
    },
    errorTraders: {
      description: "Error Traders execution list",
      type: "array",
      items: {
        type: "object",
        props: {
          taskId: {
            type: "string",
            empty: false
          },
          error: {
            type: "object",
            description: "Error object if something goes wrong.",
            props: {
              code: {
                description: "Error code.",
                type: "string",
                empty: false
              },
              message: {
                description: "Error message.",
                type: "string",
                empty: false
              },
              detail: {
                description: "Error detail.",
                type: "string",
                optional: true,
                empty: false
              }
            },
            optional: true
          }
        }
      }
    }
  }
};


/***/ }),

/***/ "../cpz-shared/config/eventTypes/tasks.js":
/*!************************************************!*\
  !*** ../cpz-shared/config/eventTypes/tasks.js ***!
  \************************************************/
/*! exports provided: TASKS_MARKETWATCHER_START_EVENT, TASKS_MARKETWATCHER_STARTED_EVENT, TASKS_MARKETWATCHER_STOP_EVENT, TASKS_MARKETWATCHER_STOPPED_EVENT, TASKS_MARKETWATCHER_SUBSCRIBE_EVENT, TASKS_MARKETWATCHER_SUBSCRIBED_EVENT, TASKS_MARKETWATCHER_UNSUBSCRIBE_EVENT, TASKS_MARKETWATCHER_UNSUBSCRIBED_EVENT, TASKS_CANDLEBATCHER_START_EVENT, TASKS_CANDLEBATCHER_STARTED_EVENT, TASKS_CANDLEBATCHER_STOP_EVENT, TASKS_CANDLEBATCHER_STOPPED_EVENT, TASKS_CANDLEBATCHER_UPDATE_EVENT, TASKS_CANDLEBATCHER_UPDATED_EVENT, TASKS_ADVISER_START_EVENT, TASKS_ADVISER_STARTED_EVENT, TASKS_ADVISER_STOP_EVENT, TASKS_ADVISER_STOPPED_EVENT, TASKS_ADVISER_UPDATE_EVENT, TASKS_ADVISER_UPDATED_EVENT, TASKS_TRADER_START_EVENT, TASKS_TRADER_STARTED_EVENT, TASKS_TRADER_STOP_EVENT, TASKS_TRADER_STOPPED_EVENT, TASKS_TRADER_UPDATE_EVENT, TASKS_TRADER_UPDATED_EVENT */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "TASKS_MARKETWATCHER_START_EVENT", function() { return TASKS_MARKETWATCHER_START_EVENT; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "TASKS_MARKETWATCHER_STARTED_EVENT", function() { return TASKS_MARKETWATCHER_STARTED_EVENT; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "TASKS_MARKETWATCHER_STOP_EVENT", function() { return TASKS_MARKETWATCHER_STOP_EVENT; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "TASKS_MARKETWATCHER_STOPPED_EVENT", function() { return TASKS_MARKETWATCHER_STOPPED_EVENT; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "TASKS_MARKETWATCHER_SUBSCRIBE_EVENT", function() { return TASKS_MARKETWATCHER_SUBSCRIBE_EVENT; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "TASKS_MARKETWATCHER_SUBSCRIBED_EVENT", function() { return TASKS_MARKETWATCHER_SUBSCRIBED_EVENT; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "TASKS_MARKETWATCHER_UNSUBSCRIBE_EVENT", function() { return TASKS_MARKETWATCHER_UNSUBSCRIBE_EVENT; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "TASKS_MARKETWATCHER_UNSUBSCRIBED_EVENT", function() { return TASKS_MARKETWATCHER_UNSUBSCRIBED_EVENT; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "TASKS_CANDLEBATCHER_START_EVENT", function() { return TASKS_CANDLEBATCHER_START_EVENT; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "TASKS_CANDLEBATCHER_STARTED_EVENT", function() { return TASKS_CANDLEBATCHER_STARTED_EVENT; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "TASKS_CANDLEBATCHER_STOP_EVENT", function() { return TASKS_CANDLEBATCHER_STOP_EVENT; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "TASKS_CANDLEBATCHER_STOPPED_EVENT", function() { return TASKS_CANDLEBATCHER_STOPPED_EVENT; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "TASKS_CANDLEBATCHER_UPDATE_EVENT", function() { return TASKS_CANDLEBATCHER_UPDATE_EVENT; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "TASKS_CANDLEBATCHER_UPDATED_EVENT", function() { return TASKS_CANDLEBATCHER_UPDATED_EVENT; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "TASKS_ADVISER_START_EVENT", function() { return TASKS_ADVISER_START_EVENT; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "TASKS_ADVISER_STARTED_EVENT", function() { return TASKS_ADVISER_STARTED_EVENT; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "TASKS_ADVISER_STOP_EVENT", function() { return TASKS_ADVISER_STOP_EVENT; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "TASKS_ADVISER_STOPPED_EVENT", function() { return TASKS_ADVISER_STOPPED_EVENT; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "TASKS_ADVISER_UPDATE_EVENT", function() { return TASKS_ADVISER_UPDATE_EVENT; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "TASKS_ADVISER_UPDATED_EVENT", function() { return TASKS_ADVISER_UPDATED_EVENT; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "TASKS_TRADER_START_EVENT", function() { return TASKS_TRADER_START_EVENT; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "TASKS_TRADER_STARTED_EVENT", function() { return TASKS_TRADER_STARTED_EVENT; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "TASKS_TRADER_STOP_EVENT", function() { return TASKS_TRADER_STOP_EVENT; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "TASKS_TRADER_STOPPED_EVENT", function() { return TASKS_TRADER_STOPPED_EVENT; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "TASKS_TRADER_UPDATE_EVENT", function() { return TASKS_TRADER_UPDATE_EVENT; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "TASKS_TRADER_UPDATED_EVENT", function() { return TASKS_TRADER_UPDATED_EVENT; });
var TASKS_MARKETWATCHER_START_EVENT = {
  eventType: "CPZ.Tasks.MarketWatcher.Start",
  dataSchema: {
    taskId: {
      description: "Uniq task id.",
      type: "string",
      empty: false
    },
    mode: {
      description: "Service run mode.",
      type: "string",
      values: ["backtest", "emulator", "realtime"]
    },
    debug: {
      description: "Debug mode.",
      type: "boolean"
    },
    providerType: {
      description: "Data provider type.",
      type: "string",
      values: ["сryptoсompare"]
    },
    exchange: {
      description: "Exchange code.",
      type: "string",
      empty: false
    },
    asset: {
      description: "Base currency.",
      type: "string",
      empty: false
    },
    currency: {
      description: "Quote currency.",
      type: "string",
      empty: false
    }
  }
};
var TASKS_MARKETWATCHER_STOP_EVENT = {
  eventType: "CPZ.Tasks.MarketWatcher.Stop",
  dataSchema: {
    taskId: {
      description: "Uniq task id.",
      type: "string",
      empty: false
    }
  }
};
var TASKS_MARKETWATCHER_SUBSCRIBE_EVENT = {
  eventType: "CPZ.Tasks.MarketWatcher.Subscribe",
  dataSchema: {
    taskId: {
      description: "Uniq task id.",
      type: "string",
      empty: false
    },
    exchange: {
      description: "Exchange code.",
      type: "string",
      empty: false
    },
    asset: {
      description: "Base currency.",
      type: "string",
      empty: false
    },
    currency: {
      description: "Quote currency.",
      type: "string",
      empty: false
    }
  }
};
var TASKS_MARKETWATCHER_UNSUBSCRIBE_EVENT = {
  eventType: "CPZ.Tasks.MarketWatcher.Unsubsribe",
  dataSchema: {
    taskId: {
      description: "Uniq task id.",
      type: "string",
      empty: false
    },
    exchange: {
      description: "Exchange code.",
      type: "string",
      empty: false
    },
    asset: {
      description: "Base currency.",
      type: "string",
      empty: false
    },
    currency: {
      description: "Quote currency.",
      type: "string",
      empty: false
    }
  }
};
var TASKS_MARKETWATCHER_STARTED_EVENT = {
  eventType: "CPZ.Tasks.MarketWatcher.Started",
  dataSchema: {
    taskId: {
      description: "Uniq task id.",
      type: "string",
      empty: false
    },
    rowKey: {
      description: "Table storage uniq row key.",
      type: "string",
      empty: false
    },
    partitionKey: {
      description: "Table storage partition key.",
      type: "string",
      empty: false
    },
    error: {
      type: "object",
      description: "Error object if something goes wrong.",
      props: {
        code: {
          description: "Error code.",
          type: "string",
          empty: false
        },
        message: {
          description: "Error message.",
          type: "string",
          empty: false
        },
        detail: {
          description: "Error detail.",
          type: "string",
          optional: true,
          empty: false
        }
      },
      optional: true
    }
  }
};
var TASKS_MARKETWATCHER_STOPPED_EVENT = {
  eventType: "CPZ.Tasks.MarketWatcher.Stopped",
  dataSchema: {
    taskId: {
      description: "Uniq task id. - 'nameProvider'",
      type: "string",
      empty: false
    },
    error: {
      type: "object",
      description: "Error object if something goes wrong.",
      props: {
        code: {
          description: "Error code.",
          type: "string",
          empty: false
        },
        message: {
          description: "Error message.",
          type: "string",
          empty: false
        },
        detail: {
          description: "Error detail.",
          type: "string",
          optional: true,
          empty: false
        }
      },
      optional: true
    }
  }
};
var TASKS_MARKETWATCHER_SUBSCRIBED_EVENT = {
  eventType: "CPZ.Tasks.MarketWatcher.Subscribed",
  dataSchema: {
    taskId: {
      description: "Uniq task id. - 'nameProvider'",
      type: "string",
      empty: false
    },
    error: {
      type: "object",
      description: "Error object if something goes wrong.",
      props: {
        code: {
          description: "Error code.",
          type: "string",
          empty: false
        },
        message: {
          description: "Error message.",
          type: "string",
          empty: false
        },
        detail: {
          description: "Error detail.",
          type: "string",
          optional: true,
          empty: false
        }
      },
      optional: true
    }
  }
};
var TASKS_MARKETWATCHER_UNSUBSCRIBED_EVENT = {
  eventType: "CPZ.Tasks.MarketWatcher.Unsubscribed",
  dataSchema: {
    taskId: {
      description: "Uniq task id.",
      type: "string",
      empty: false
    },
    error: {
      type: "object",
      description: "Error object if something goes wrong.",
      props: {
        code: {
          description: "Error code.",
          type: "string",
          empty: false
        },
        message: {
          description: "Error message.",
          type: "string",
          empty: false
        },
        detail: {
          description: "Error detail.",
          type: "string",
          optional: true,
          empty: false
        }
      },
      optional: true
    }
  }
};
var TASKS_CANDLEBATCHER_START_EVENT = {
  eventType: "CPZ.Tasks.Candlebatcher.Start",
  dataSchema: {
    taskId: {
      description: "Uniq task id.",
      type: "string",
      empty: false
    },
    mode: {
      description: "Service run mode.",
      type: "string",
      values: ["backtest", "emulator", "realtime"]
    },
    debug: {
      description: "Debug mode.",
      type: "boolean"
    },
    providerType: {
      description: "Data provider type.",
      type: "string",
      values: ["cryptocompare", "ccxt"]
    },
    exchange: {
      description: "Exchange code.",
      type: "string",
      empty: false
    },
    asset: {
      description: "Base currency.",
      type: "string",
      empty: false
    },
    currency: {
      description: "Quote currency.",
      type: "string",
      empty: false
    },
    timeframes: {
      description: "List of timeframes in minutes.",
      type: "array",
      items: "number"
    },
    proxy: {
      description: "Proxy endpoint.",
      type: "string",
      optional: true,
      empty: false
    }
  }
};
var TASKS_CANDLEBATCHER_STOP_EVENT = {
  eventType: "CPZ.Tasks.Candlebatcher.Stop",
  subject: "{Exchange}/{Asset}/{Currency}/{TaskId}.{B/E/R}",
  dataSchema: {
    taskId: {
      description: "Uniq task id.",
      type: "string",
      empty: false
    },
    rowKey: {
      description: "Table storage uniq row key.",
      type: "string",
      empty: false
    },
    partitionKey: {
      description: "Table storage partition key.",
      type: "string",
      empty: false
    }
  }
};
var TASKS_CANDLEBATCHER_UPDATE_EVENT = {
  eventType: "CPZ.Tasks.Candlebatcher.Update",
  dataSchema: {
    taskId: {
      description: "Uniq task id.",
      type: "string",
      empty: false
    },
    rowKey: {
      description: "Table storage uniq row key.",
      type: "string",
      empty: false
    },
    partitionKey: {
      description: "Table storage partition key.",
      type: "string",
      empty: false
    },
    debug: {
      description: "Debug mode.",
      type: "boolean"
    },
    timeframes: {
      description: "List of timeframes in minutes.",
      type: "array",
      items: "number"
    },
    proxy: {
      description: "Proxy endpoint.",
      type: "string",
      optional: true,
      empty: false
    }
  }
};
var TASKS_CANDLEBATCHER_STARTED_EVENT = {
  eventType: "CPZ.Tasks.Candlebatcher.Started",
  dataSchema: {
    taskId: {
      description: "Uniq task id.",
      type: "string",
      empty: false
    },
    rowKey: {
      description: "Table storage uniq row key.",
      type: "string",
      empty: false
    },
    partitionKey: {
      description: "Table storage partition key.",
      type: "string",
      empty: false
    },
    error: {
      type: "object",
      description: "Error object if something goes wrong.",
      props: {
        code: {
          description: "Error code.",
          type: "string",
          empty: false
        },
        message: {
          description: "Error message.",
          type: "string",
          empty: false
        },
        detail: {
          description: "Error detail.",
          type: "string",
          optional: true,
          empty: false
        }
      },
      optional: true
    }
  }
};
var TASKS_CANDLEBATCHER_STOPPED_EVENT = {
  eventType: "CPZ.Tasks.Candlebatcher.Stopped",
  dataSchema: {
    taskId: {
      description: "Uniq task id.",
      type: "string",
      empty: false
    },
    error: {
      type: "object",
      description: "Error object if something goes wrong.",
      props: {
        code: {
          description: "Error code.",
          type: "string",
          empty: false
        },
        message: {
          description: "Error message.",
          type: "string",
          empty: false
        },
        detail: {
          description: "Error detail.",
          type: "string",
          optional: true,
          empty: false
        }
      },
      optional: true
    }
  }
};
var TASKS_CANDLEBATCHER_UPDATED_EVENT = {
  eventType: "CPZ.Tasks.Candlebatcher.Updated",
  dataSchema: {
    taskId: {
      description: "Uniq task id.",
      type: "string",
      empty: false
    },
    error: {
      type: "object",
      description: "Error object if something goes wrong.",
      props: {
        code: {
          description: "Error code.",
          type: "string",
          empty: false
        },
        message: {
          description: "Error message.",
          type: "string",
          empty: false
        },
        detail: {
          description: "Error detail.",
          type: "string",
          optional: true,
          empty: false
        }
      },
      optional: true
    }
  }
};
var TASKS_ADVISER_START_EVENT = {
  eventType: "CPZ.Tasks.Adviser.Start",
  dataSchema: {
    taskId: {
      description: "Uniq task id.",
      type: "string",
      empty: false
    },
    robotId: {
      description: "Robot uniq Id.",
      type: "string",
      empty: false
    },
    mode: {
      description: "Service run mode.",
      type: "string",
      values: ["backtest", "emulator", "realtime"]
    },
    debug: {
      description: "Debug mode.",
      type: "boolean",
      empty: false
    },
    strategy: {
      description: "Strategy file name.",
      type: "string",
      empty: false
    },
    exchange: {
      description: "Exchange code.",
      type: "string",
      empty: false
    },
    asset: {
      description: "Base currency.",
      type: "string",
      empty: false
    },
    currency: {
      description: "Quote currency.",
      type: "string",
      empty: false
    },
    timeframe: {
      description: "Timeframe in minutes.",
      type: "number"
    },
    settings: {
      description: "Adviser parameters.",
      type: "object"
    }
  }
};
var TASKS_ADVISER_STOP_EVENT = {
  eventType: "CPZ.Tasks.Adviser.Stop",
  dataSchema: {
    taskId: {
      description: "Uniq task id.",
      type: "string",
      empty: false
    },
    rowKey: {
      description: "Table storage uniq row key.",
      type: "string",
      empty: false
    },
    partitionKey: {
      description: "Table storage partition key.",
      type: "string",
      empty: false
    }
  }
};
var TASKS_ADVISER_UPDATE_EVENT = {
  eventType: "CPZ.Tasks.Adviser.Update",
  dataSchema: {
    taskId: {
      description: "Uniq task id.",
      type: "string",
      empty: false
    },
    rowKey: {
      description: "Table storage uniq row key.",
      type: "string",
      empty: false
    },
    partitionKey: {
      description: "Table storage partition key.",
      type: "string",
      empty: false
    },
    debug: {
      description: "Debug mode.",
      type: "boolean"
    },
    settings: {
      description: "Adviser parameters.",
      type: "object"
    }
  }
};
var TASKS_ADVISER_STARTED_EVENT = {
  eventType: "CPZ.Tasks.Adviser.Started",
  dataSchema: {
    taskId: {
      description: "Uniq task id.",
      type: "string",
      empty: false
    },
    rowKey: {
      description: "Table storage uniq row key.",
      type: "string",
      empty: false
    },
    partitionKey: {
      description: "Table storage partition key.",
      type: "string",
      empty: false
    },
    error: {
      type: "object",
      description: "Error object if something goes wrong.",
      props: {
        code: {
          description: "Error code.",
          type: "string"
        },
        message: {
          description: "Error message.",
          type: "string"
        },
        detail: {
          description: "Error detail.",
          type: "string",
          optional: true,
          empty: false
        }
      },
      optional: true
    }
  }
};
var TASKS_ADVISER_STOPPED_EVENT = {
  eventType: "CPZ.Tasks.Adviser.Stopped",
  dataSchema: {
    taskId: {
      description: "Uniq task id.",
      type: "string",
      empty: false
    },
    error: {
      type: "object",
      description: "Error object if something goes wrong.",
      props: {
        code: {
          description: "Error code.",
          type: "string",
          empty: false
        },
        message: {
          description: "Error message.",
          type: "string",
          empty: false
        },
        detail: {
          description: "Error detail.",
          type: "string",
          optional: true,
          empty: false
        }
      },
      optional: true
    }
  }
};
var TASKS_ADVISER_UPDATED_EVENT = {
  eventType: "CPZ.Tasks.Adviser.Updated",
  dataSchema: {
    taskId: {
      description: "Uniq task id.",
      type: "string",
      empty: false
    },
    error: {
      type: "object",
      description: "Error object if something goes wrong.",
      props: {
        code: {
          description: "Error code.",
          type: "string",
          empty: false
        },
        message: {
          description: "Error message.",
          type: "string",
          empty: false
        },
        detail: {
          description: "Error detail.",
          type: "string",
          optional: true,
          empty: false
        }
      },
      optional: true
    }
  }
};
var TASKS_TRADER_START_EVENT = {
  eventType: "CPZ.Tasks.Trader.Start",
  dataSchema: {
    taskId: {
      description: "Uniq task id.",
      type: "string",
      empty: false
    },
    mode: {
      description: "Service run mode.",
      type: "string",
      values: ["backtest", "emulator", "realtime"]
    },
    debug: {
      description: "Debug mode.",
      type: "boolean"
    },
    exchange: {
      description: "Exchange code.",
      type: "string",
      empty: false
    },
    asset: {
      description: "Base currency.",
      type: "string",
      empty: false
    },
    currency: {
      description: "Quote currency.",
      type: "string",
      empty: false
    },
    timeframe: {
      description: "Timeframe in minutes.",
      type: "number"
    },
    robotId: {
      description: "Robot uniq Id. - 'AdvisorName'",
      type: "string",
      empty: false
    },
    userId: {
      description: "User uniq Id.",
      type: "string",
      empty: false
    },
    settings: {
      description: "Trader parameters.",
      type: "object",
      props: {
        slippageStep: {
          description: "Price Slippage Step.",
          type: "number"
        },
        volume: {
          description: "User trade volume",
          type: "number"
        }
      },
      optional: true
    }
  }
};
var TASKS_TRADER_STOP_EVENT = {
  eventType: "CPZ.Tasks.Trader.Stop",
  dataSchema: {
    taskId: {
      description: "Uniq task id.",
      type: "string",
      empty: false
    },
    robotId: {
      description: "Robot id.",
      type: "string",
      empty: false
    }
  }
};
var TASKS_TRADER_UPDATE_EVENT = {
  eventType: "CPZ.Tasks.Trader.Update",
  dataSchema: {
    taskId: {
      description: "Uniq task id.",
      type: "string",
      empty: false
    },
    debug: {
      description: "Debug mode.",
      type: "boolean"
    },
    settings: {
      description: "Trader parameters.",
      type: "object",
      props: {
        slippageStep: {
          description: "Price Slippage Step.",
          type: "number"
        },
        volume: {
          description: "User trade volume",
          type: "number"
        }
      },
      optional: true
    }
  }
};
var TASKS_TRADER_STARTED_EVENT = {
  eventType: "CPZ.Tasks.Trader.Started",
  dataSchema: {
    taskId: {
      description: "Uniq task id.",
      type: "string",
      empty: false
    },
    rowKey: {
      description: "Table storage uniq row key.",
      type: "string",
      empty: false
    },
    partitionKey: {
      description: "Table storage partition key.",
      type: "string",
      empty: false
    },
    error: {
      type: "object",
      description: "Error object if something goes wrong.",
      props: {
        code: {
          description: "Error code.",
          type: "string",
          empty: false
        },
        message: {
          description: "Error message.",
          type: "string",
          empty: false
        },
        detail: {
          description: "Error detail.",
          type: "string",
          optional: true,
          empty: false
        }
      },
      optional: true
    }
  }
};
var TASKS_TRADER_STOPPED_EVENT = {
  eventType: "CPZ.Tasks.Trader.Stopped",
  dataSchema: {
    taskId: {
      description: "Uniq task id.",
      type: "string",
      empty: false
    },
    error: {
      type: "object",
      description: "Error object if something goes wrong.",
      props: {
        code: {
          description: "Error code.",
          type: "string",
          empty: false
        },
        message: {
          description: "Error message.",
          type: "string",
          empty: false
        },
        detail: {
          description: "Error detail.",
          type: "string",
          optional: true,
          empty: false
        }
      },
      optional: true
    }
  }
};
var TASKS_TRADER_UPDATED_EVENT = {
  eventType: "CPZ.Tasks.Trader.Updated",
  dataSchema: {
    taskId: {
      description: "Uniq task id.",
      type: "string",
      empty: false
    },
    error: {
      type: "object",
      description: "Error object if something goes wrong.",
      props: {
        code: {
          description: "Error code.",
          type: "string",
          empty: false
        },
        message: {
          description: "Error message.",
          type: "string",
          empty: false
        },
        detail: {
          description: "Error detail.",
          type: "string",
          optional: true,
          empty: false
        }
      },
      optional: true
    }
  }
};


/***/ }),

/***/ "../cpz-shared/config/eventTypes/ticks.js":
/*!************************************************!*\
  !*** ../cpz-shared/config/eventTypes/ticks.js ***!
  \************************************************/
/*! exports provided: TICKS_NEWTICK_EVENT, TICKS_HANDLED_EVENT */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "TICKS_NEWTICK_EVENT", function() { return TICKS_NEWTICK_EVENT; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "TICKS_HANDLED_EVENT", function() { return TICKS_HANDLED_EVENT; });
var TICKS_NEWTICK_EVENT = {
  eventType: "CPZ.Ticks.NewTick",
  dataSchema: {
    exchange: {
      description: "Exchange code.",
      type: "string",
      empty: false
    },
    asset: {
      description: "Base currency.",
      type: "string",
      empty: false
    },
    currency: {
      description: "Quote currency.",
      type: "string",
      empty: false
    },
    side: {
      description: "Trade side.",
      type: "string",
      values: ["buy", "sell"]
    },
    tradeId: {
      description: "Trade ID.",
      type: "string",
      empty: false
    },
    time: {
      description: "Trade time in seconds.",
      type: "number"
    },
    volume: {
      description: "Trade Volume.",
      type: "number"
    },
    price: {
      description: "Trade Price.",
      type: "number"
    }
  }
};
var TICKS_HANDLED_EVENT = {
  eventType: "CPZ.Ticks.Handled",
  dataSchema: {
    tradeId: {
      description: "Uniq Trade Id.",
      type: "string",
      empty: false
    },
    service: {
      description: "Sevice name handeling event",
      type: "string",
      values: ["trader"]
    },
    success: {
      description: "Success execution list",
      type: "array",
      items: "string"
    },
    error: {
      description: "Error execution list",
      type: "array",
      items: {
        type: "object",
        props: {
          taskId: {
            type: "string",
            empty: false
          },
          error: {
            type: "object",
            description: "Error object if something goes wrong.",
            props: {
              code: {
                description: "Error code.",
                type: "string",
                empty: false
              },
              message: {
                description: "Error message.",
                type: "string",
                empty: false
              },
              detail: {
                description: "Error detail.",
                type: "string",
                optional: true,
                empty: false
              }
            },
            optional: true
          }
        }
      }
    }
  }
};


/***/ }),

/***/ "../cpz-shared/config/services/index.js":
/*!**********************************************!*\
  !*** ../cpz-shared/config/services/index.js ***!
  \**********************************************/
/*! exports provided: ADVISER_SERVICE */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ADVISER_SERVICE", function() { return ADVISER_SERVICE; });
var ADVISER_SERVICE = "adviser";


/***/ }),

/***/ "../cpz-shared/config/state/index.js":
/*!*******************************************!*\
  !*** ../cpz-shared/config/state/index.js ***!
  \*******************************************/
/*! exports provided: INDICATORS_BASE, INDICATORS_TULIP, STATUS_BUSY, STATUS_ERROR, STATUS_FINISHED, STATUS_PENDING, STATUS_STARTED, STATUS_STOPPED */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _indicators__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./indicators */ "../cpz-shared/config/state/indicators.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "INDICATORS_BASE", function() { return _indicators__WEBPACK_IMPORTED_MODULE_0__["INDICATORS_BASE"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "INDICATORS_TULIP", function() { return _indicators__WEBPACK_IMPORTED_MODULE_0__["INDICATORS_TULIP"]; });

/* harmony import */ var _status__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./status */ "../cpz-shared/config/state/status.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "STATUS_BUSY", function() { return _status__WEBPACK_IMPORTED_MODULE_1__["STATUS_BUSY"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "STATUS_ERROR", function() { return _status__WEBPACK_IMPORTED_MODULE_1__["STATUS_ERROR"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "STATUS_FINISHED", function() { return _status__WEBPACK_IMPORTED_MODULE_1__["STATUS_FINISHED"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "STATUS_PENDING", function() { return _status__WEBPACK_IMPORTED_MODULE_1__["STATUS_PENDING"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "STATUS_STARTED", function() { return _status__WEBPACK_IMPORTED_MODULE_1__["STATUS_STARTED"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "STATUS_STOPPED", function() { return _status__WEBPACK_IMPORTED_MODULE_1__["STATUS_STOPPED"]; });




/***/ }),

/***/ "../cpz-shared/config/state/indicators.js":
/*!************************************************!*\
  !*** ../cpz-shared/config/state/indicators.js ***!
  \************************************************/
/*! exports provided: INDICATORS_BASE, INDICATORS_TULIP */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "INDICATORS_BASE", function() { return INDICATORS_BASE; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "INDICATORS_TULIP", function() { return INDICATORS_TULIP; });
var INDICATORS_BASE = "base";
var INDICATORS_TULIP = "tulip";


/***/ }),

/***/ "../cpz-shared/config/state/status.js":
/*!********************************************!*\
  !*** ../cpz-shared/config/state/status.js ***!
  \********************************************/
/*! exports provided: STATUS_BUSY, STATUS_ERROR, STATUS_FINISHED, STATUS_PENDING, STATUS_STARTED, STATUS_STOPPED */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "STATUS_BUSY", function() { return STATUS_BUSY; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "STATUS_ERROR", function() { return STATUS_ERROR; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "STATUS_FINISHED", function() { return STATUS_FINISHED; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "STATUS_PENDING", function() { return STATUS_PENDING; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "STATUS_STARTED", function() { return STATUS_STARTED; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "STATUS_STOPPED", function() { return STATUS_STOPPED; });
var STATUS_STARTED = "started";
var STATUS_PENDING = "pending";
var STATUS_BUSY = "busy";
var STATUS_STOPPED = "stopped";
var STATUS_ERROR = "error";
var STATUS_FINISHED = "finished";


/***/ }),

/***/ "../cpz-shared/config/storageTables/index.js":
/*!***************************************************!*\
  !*** ../cpz-shared/config/storageTables/index.js ***!
  \***************************************************/
/*! exports provided: STORAGE_ADVISERS_TABLE, STORAGE_CANDLESCACHED_TABLE, STORAGE_CANDLESPENDING_TABLE */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "STORAGE_ADVISERS_TABLE", function() { return STORAGE_ADVISERS_TABLE; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "STORAGE_CANDLESCACHED_TABLE", function() { return STORAGE_CANDLESCACHED_TABLE; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "STORAGE_CANDLESPENDING_TABLE", function() { return STORAGE_CANDLESPENDING_TABLE; });
var STORAGE_ADVISERS_TABLE = "Advisers";
var STORAGE_CANDLESCACHED_TABLE = "CandlesCached";
var STORAGE_CANDLESPENDING_TABLE = "CandlesPending";


/***/ }),

/***/ "./src/adviser/adviser.js":
/*!********************************!*\
  !*** ./src/adviser/adviser.js ***!
  \********************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/regenerator */ "@babel/runtime/regenerator");
/* harmony import */ var _babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _babel_runtime_helpers_asyncToGenerator__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @babel/runtime/helpers/asyncToGenerator */ "@babel/runtime/helpers/asyncToGenerator");
/* harmony import */ var _babel_runtime_helpers_asyncToGenerator__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_babel_runtime_helpers_asyncToGenerator__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _babel_runtime_helpers_objectSpread__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @babel/runtime/helpers/objectSpread */ "@babel/runtime/helpers/objectSpread");
/* harmony import */ var _babel_runtime_helpers_objectSpread__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_babel_runtime_helpers_objectSpread__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @babel/runtime/helpers/classCallCheck */ "@babel/runtime/helpers/classCallCheck");
/* harmony import */ var _babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @babel/runtime/helpers/createClass */ "@babel/runtime/helpers/createClass");
/* harmony import */ var _babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var uuid__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! uuid */ "uuid");
/* harmony import */ var uuid__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(uuid__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var dayjs__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! dayjs */ "dayjs");
/* harmony import */ var dayjs__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(dayjs__WEBPACK_IMPORTED_MODULE_6__);
/* harmony import */ var cpzEventTypes__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! cpzEventTypes */ "../cpz-shared/config/eventTypes/index.js");
/* harmony import */ var cpzState__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! cpzState */ "../cpz-shared/config/state/index.js");
/* harmony import */ var cpzDefaults__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! cpzDefaults */ "../cpz-shared/config/defaults/index.js");
/* harmony import */ var _baseStrategy__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./baseStrategy */ "./src/adviser/baseStrategy.js");
/* harmony import */ var _baseIndicator__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./baseIndicator */ "./src/adviser/baseIndicator.js");
/* harmony import */ var _lib_tulip_tulipIndicators__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ../lib/tulip/tulipIndicators */ "./src/lib/tulip/tulipIndicators.js");
/* harmony import */ var _tableStorage__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ../tableStorage */ "./src/tableStorage/index.js");
/* harmony import */ var _eventgrid__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! ../eventgrid */ "./src/eventgrid/index.js");















/**
 * Класс советника
 *
 * @class Adviser
 */

var Adviser =
/*#__PURE__*/
function () {
  /**
   *Конструктор
   * @param {Object} context
   * @param {Object} state
   */
  function Adviser(context, state) {
    _babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_3___default()(this, Adviser);

    this._context = context; // текущий контекст выполнения

    this._eventSubject = state.eventSubject; // тема события

    this._taskId = state.taskId; // уникальный идентификатор задачи

    this._robotId = state.robotId; // идентификатор робота

    this._mode = state.mode; // режим работы ['backtest', 'emulator', 'realtime']

    this._debug = state.debug; // режима дебага [true,false]

    this._settings = state.settings || {}; // объект настроек из веб-интерфейса

    this._exchange = state.exchange; // код биржи

    this._asset = state.asset; // базовая валюта

    this._currency = state.currency; // котировка валюты

    this._timeframe = state.timeframe; // таймфрейм

    this._strategyName = state.strategyName; // имя файла стратегии

    this._requiredHistoryCache = state.requiredHistoryCache || true; // загружать историю из кэша

    this._requiredHistoryMaxBars = state.requiredHistoryMaxBars || cpzDefaults__WEBPACK_IMPORTED_MODULE_9__["REQUIRED_HISTORY_MAX_BARS"]; // максимально количество свечей в кэше

    this._strategy = state.strategy || {
      variables: {}
    }; // состояне стратегии

    this._indicators = state.indicators || {}; // состояние индикаторов

    this._candle = {}; // текущая свеча

    this._lastCandle = state.lastCandle || {}; // последняя свеча

    this._indicators = state.indicators || {}; // индикаторы

    this._signals = []; // массив сигналов к отправке

    this._lastSignals = state.lastSignals || []; // массив последних сигналов

    this._updateRequested = state.updateRequested || false; // объект запроса на обновление параметров {debug,proxy,timeframes,eventSubject} или false

    this._stopRequested = state.stopRequested || false; // признак запроса на остановку сервиса [true,false]

    this._status = this._stopRequested ? cpzState__WEBPACK_IMPORTED_MODULE_8__["STATUS_STOPPED"] : state.status || cpzState__WEBPACK_IMPORTED_MODULE_8__["STATUS_STARTED"]; // текущий статус сервиса

    this._startedAt = state.startedAt || dayjs__WEBPACK_IMPORTED_MODULE_6___default()().toJSON(); //  Дата и время запуска

    this._endedAt = state.endedAt || this._status === cpzState__WEBPACK_IMPORTED_MODULE_8__["STATUS_STOPPED"] ? dayjs__WEBPACK_IMPORTED_MODULE_6___default()().toJSON() : ""; // Дата и время остановки

    this._initialized = state.initialized || false;
    this.loadStrategy();
    this.loadIndicators();

    if (!this._initialized) {
      this.initStrategy();
      this._initialized = true;
    }
  }
  /**
   * Загрузка стратегии
   *
   * @memberof Adviser
   */


  _babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_4___default()(Adviser, [{
    key: "loadStrategy",
    value: function loadStrategy() {
      try {
        // Считываем стратегию

        /* eslint-disable import/no-dynamic-require, global-require */
        var strategyObject = __webpack_require__("./src/strategies sync recursive ^\\.\\/.*$")("./".concat(this._strategyName));
        /* import/no-dynamic-require, global-require */


        this._context.log(JSON.stringify(strategyObject));

        var strategyFunctions = {};
        Object.getOwnPropertyNames(strategyObject).filter(function (key) {
          return typeof strategyObject[key] === "function";
        }).forEach(function (key) {
          strategyFunctions[key] = strategyObject[key];
        });

        this._context.log(strategyFunctions); // Создаем новый инстанс класса стратегии


        this._strategyInstance = new _baseStrategy__WEBPACK_IMPORTED_MODULE_10__["default"](_babel_runtime_helpers_objectSpread__WEBPACK_IMPORTED_MODULE_2___default()({
          context: this._context,
          initialized: this._strategy._initialized,
          settings: this._settings,
          exchange: this._exchange,
          asset: this._asset,
          currency: this._currency,
          timeframe: this._timeframe,
          advice: this.advice.bind(this),
          // функция advise -> adviser.advise
          log: this.log.bind(this),
          // функция log -> advise.log
          logEvent: this.logEvent.bind(this),
          // функция logEvent -> advise.logEvent
          strategyFunctions: strategyFunctions
        }, this._strategy));
      } catch (error) {
        throw new Error("Load strategy \"".concat(this._strategyName, " error:\"\n").concat(error));
      }
    }
    /**
     *  Загрузка индикаторов
     *
     * @memberof Adviser
     */

  }, {
    key: "loadIndicators",
    value: function loadIndicators() {
      var _this = this;

      this.log("loadIndicators()");

      try {
        // Идем по всем свойствам в объекте индикаторов
        Object.keys(this._indicators).forEach(function (key) {
          // Считываем индикатор по ключу
          var indicator = _this._indicators[key]; // В зависимости от типа индикатора

          switch (indicator.type) {
            case cpzState__WEBPACK_IMPORTED_MODULE_8__["INDICATORS_BASE"]:
              {
                // Если базовый индикатор
                try {
                  // Считываем объект индикатора

                  /* eslint-disable import/no-dynamic-require, global-require */
                  var indicatorObject = __webpack_require__("./src/indicators sync recursive ^\\.\\/.*$")("./".concat(indicator.fileName));
                  /* import/no-dynamic-require, global-require */
                  // Берем все функции индикатора


                  var indicatorFunctions = {};
                  Object.getOwnPropertyNames(indicatorObject).filter(function (ownProp) {
                    return typeof indicatorObject[ownProp] === "function";
                  }).forEach(function (ownProp) {
                    indicatorFunctions[ownProp] = indicatorObject[ownProp];
                  }); // Создаем новый инстанc базового индикатора

                  _this["_".concat(key, "Instance")] = new _baseIndicator__WEBPACK_IMPORTED_MODULE_11__["default"](_babel_runtime_helpers_objectSpread__WEBPACK_IMPORTED_MODULE_2___default()({
                    context: _this._context,
                    exchange: _this._exchange,
                    asset: _this._asset,
                    currency: _this._currency,
                    timeframe: _this._timeframe,
                    log: _this.log.bind(_this),
                    // функция log -> advise.log
                    logEvent: _this.logEvent.bind(_this),
                    // функция logEvent -> advise.logEvent
                    indicatorFunctions: indicatorFunctions
                  }, indicator));
                } catch (err) {
                  throw new Error("Can't load indicator ".concat(key, " error:\n").concat(err));
                }

                break;
              }

            case cpzState__WEBPACK_IMPORTED_MODULE_8__["INDICATORS_TULIP"]:
              {
                // Если внешний индикатор Tulip
                try {
                  // Создаем новый инстанc индикатора Tulip
                  _this["_".concat(key, "Instance")] = new _lib_tulip_tulipIndicators__WEBPACK_IMPORTED_MODULE_12__["default"](_babel_runtime_helpers_objectSpread__WEBPACK_IMPORTED_MODULE_2___default()({
                    context: _this._context,
                    exchange: _this._exchange,
                    asset: _this._asset,
                    currency: _this._currency,
                    timeframe: _this._timeframe,
                    options: indicator.options,
                    log: _this.log.bind(_this),
                    // функция log -> advise.log
                    logEvent: _this.logEvent.bind(_this)
                  }, indicator));
                } catch (err) {
                  throw new Error("Can't load Tulip indicator ".concat(key, " error:\n").concat(err));
                }

                break;
              }

            default:
              // Неизвестный тип индикатора - ошибка
              throw new Error("Unknown indicator type ".concat(indicator.type));
          }
        });
      } catch (error) {
        throw new Error("Load indicators \"".concat(this._strategyName, " error:\"\n").concat(error));
      }
    }
    /**
     * Инициализация стратегии
     *
     * @memberof Adviser
     */

  }, {
    key: "initStrategy",
    value: function initStrategy() {
      this._context.log("initStrategy");

      try {
        // Если стратегия еще не проинициализирована
        if (!this._strategyInstance.initialized) {
          // Инициализируем
          this._strategyInstance.init();

          this._strategyInstance.initialized = true; // Считываем настройки индикаторов

          this._indicators = this._strategyInstance.indicators;

          this._context.log(this._indicators); // Загружаем индикаторы


          this.loadIndicators(); // Инициализируем индикаторы

          this.initIndicators();
        }
      } catch (error) {
        throw new Error("Init strategy \"".concat(this._strategyName, " error:\"\n").concat(error));
      }
    }
    /**
     * Инициализация индикаторов
     *
     * @memberof Adviser
     */

  }, {
    key: "initIndicators",
    value: function initIndicators() {
      var _this2 = this;

      this._context.log("initIndicators");

      try {
        Object.keys(this._indicators).forEach(function (key) {
          try {
            if (!_this2["_".concat(key, "Instance")].initialized) {
              _this2["_".concat(key, "Instance")].init();

              _this2["_".concat(key, "Instance")].initialized = true;
            }
          } catch (err) {
            throw new Error("Can't initialize indicator ".concat(key, " error:\n").concat(err));
          }
        });
      } catch (error) {
        throw new Error("Init indicators \"".concat(this._strategyName, " error:\"\n").concat(error));
      }
    }
    /**
     * Пересчет индикаторов
     *
     * @memberof Adviser
     */

  }, {
    key: "calcIndicators",
    value: function () {
      var _calcIndicators = _babel_runtime_helpers_asyncToGenerator__WEBPACK_IMPORTED_MODULE_1___default()(
      /*#__PURE__*/
      _babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_0___default.a.mark(function _callee2() {
        var _this3 = this;

        return _babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_0___default.a.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                this._context.log("calcIndicators");

                _context2.prev = 1;
                _context2.next = 4;
                return Promise.all(Object.keys(this._indicators).map(
                /*#__PURE__*/
                function () {
                  var _ref = _babel_runtime_helpers_asyncToGenerator__WEBPACK_IMPORTED_MODULE_1___default()(
                  /*#__PURE__*/
                  _babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_0___default.a.mark(function _callee(key) {
                    return _babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_0___default.a.wrap(function _callee$(_context) {
                      while (1) {
                        switch (_context.prev = _context.next) {
                          case 0:
                            _this3["_".concat(key, "Instance")].handleCandle(_this3._candle, _this3._candles, _this3._candlesProps);

                            _context.next = 3;
                            return _this3["_".concat(key, "Instance")].calc();

                          case 3:
                          case "end":
                            return _context.stop();
                        }
                      }
                    }, _callee, this);
                  }));

                  return function (_x) {
                    return _ref.apply(this, arguments);
                  };
                }()));

              case 4:
                _context2.next = 9;
                break;

              case 6:
                _context2.prev = 6;
                _context2.t0 = _context2["catch"](1);
                throw new Error("Calculate indicators \"".concat(this._strategyName, " error:\"\n").concat(_context2.t0));

              case 9:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this, [[1, 6]]);
      }));

      return function calcIndicators() {
        return _calcIndicators.apply(this, arguments);
      };
    }()
    /**
     * Логирование в консоль
     *
     * @param {*} args
     * @memberof Adviser
     */

  }, {
    key: "log",
    value: function log() {
      if (this._debug) {
        var _this$_context$log;

        for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }

        (_this$_context$log = this._context.log).info.apply(_this$_context$log, ["Adviser ".concat(this._eventSubject, ":")].concat(args));
      }
    }
    /**
     * Логирование в EventGrid в топик CPZ-LOGS
     *
     * @param {*} data
     * @memberof Adviser
     */

  }, {
    key: "logEvent",
    value: function logEvent(data) {
      // Публикуем событие
      Object(_eventgrid__WEBPACK_IMPORTED_MODULE_14__["publishEvents"])(this._context, "log", Object(_eventgrid__WEBPACK_IMPORTED_MODULE_14__["createEvents"])({
        subject: this._eventSubject,
        eventType: cpzEventTypes__WEBPACK_IMPORTED_MODULE_7__["LOG_ADVISER_EVENT"].eventType,
        data: {
          taskId: this._taskId,
          data: data
        }
      }));
    }
    /**
     * Запрос текущего статуса сервиса
     *
     * @returns status
     * @memberof Adviser
     */

  }, {
    key: "setUpdate",

    /**
     * Установка новых параметров
     *
     * @param {*} [updatedFields=this.updateRequested]
     * @memberof Adviser
     */
    value: function setUpdate() {
      var updatedFields = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this._updateRequested;
      this.log("setUpdate()", updatedFields);
      this._debug = updatedFields.debug || this._debug;
      this._settings = updatedFields.settings || this._settings;
      this._requiredHistoryCache = updatedFields._requiredHistoryCache || this._requiredHistoryCache;
      this._requiredHistoryMaxBars = updatedFields._requiredHistoryMaxBars || this._requiredHistoryMaxBars;
    }
    /**
     * Загрузка свечей из кэша
     *
     * @memberof Adviser
     */

  }, {
    key: "_loadCandles",
    value: function () {
      var _loadCandles2 = _babel_runtime_helpers_asyncToGenerator__WEBPACK_IMPORTED_MODULE_1___default()(
      /*#__PURE__*/
      _babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_0___default.a.mark(function _callee3() {
        var result;
        return _babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_0___default.a.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                _context3.next = 2;
                return Object(_tableStorage__WEBPACK_IMPORTED_MODULE_13__["getCachedCandlesByKey"])(this._context, "".concat(this._exchange, ".").concat(this._asset, ".").concat(this._currency, ".").concat(this._timeframe), this._requiredHistoryMaxBars);

              case 2:
                result = _context3.sent;

                if (!result.isSuccess) {
                  _context3.next = 7;
                  break;
                }

                this._candles = result.data.reverse();
                _context3.next = 8;
                break;

              case 7:
                throw result.error;

              case 8:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      return function _loadCandles() {
        return _loadCandles2.apply(this, arguments);
      };
    }()
    /**
     * Преобразование свечей для индикаторов
     *
     * @memberof Adviser
     */

  }, {
    key: "_prepareCandles",
    value: function _prepareCandles() {
      var _this4 = this;

      this._candlesProps = {
        open: [],
        high: [],
        low: [],
        close: [],
        volume: []
      };

      this._candles.forEach(function (candle) {
        _this4._candlesProps.open.push(candle.open);

        _this4._candlesProps.high.push(candle.high);

        _this4._candlesProps.low.push(candle.low);

        _this4._candlesProps.close.push(candle.close);

        _this4._candlesProps.volume.push(candle.volume);
      });
    }
    /**
     * Обработка новой свечи
     *
     * @param {*} candle
     * @memberof Adviser
     */

  }, {
    key: "handleCandle",
    value: function () {
      var _handleCandle = _babel_runtime_helpers_asyncToGenerator__WEBPACK_IMPORTED_MODULE_1___default()(
      /*#__PURE__*/
      _babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_0___default.a.mark(function _callee4(candle) {
        return _babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_0___default.a.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                _context4.prev = 0;
                this.log("handleCandle"); // TODO: Проверить что эта свеча еще не обрабатывалась
                // Обновить текущую свечу

                this._candle = candle; // Если нужна история

                if (!this._requiredHistoryCache) {
                  _context4.next = 8;
                  break;
                }

                _context4.next = 6;
                return this._loadCandles();

              case 6:
                _context4.next = 9;
                break;

              case 8:
                // Обрабатываем только текущую свечу
                this._candles.push(this._candle);

              case 9:
                // Подготовить свечи для индикаторов
                this._prepareCandles(); // Рассчитать значения индикаторов


                _context4.next = 12;
                return this.calcIndicators();

              case 12:
                // Считать текущее состояние индикаторов
                this.getIndicatorsState(); // Передать свечу и значения индикаторов в инстанс стратегии

                this._strategyInstance.handleCandle(this._candle, this._indicators); // Запустить проверку стратегии


                this._strategyInstance.check(); // TODO: Отдельный метод check с отловом ошибок?


                _context4.next = 21;
                break;

              case 17:
                _context4.prev = 17;
                _context4.t0 = _context4["catch"](0);

                this._context.log.error(_context4.t0);

                throw _context4.t0;

              case 21:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee4, this, [[0, 17]]);
      }));

      return function handleCandle(_x2) {
        return _handleCandle.apply(this, arguments);
      };
    }()
    /**
     * Генерация темы события NewSignal
     *
     * @returns subject
     * @memberof Candlebatcher
     */

  }, {
    key: "_createSubject",
    value: function _createSubject() {
      var modeToStr = function modeToStr(mode) {
        switch (mode) {
          case "realtime":
            return "R";

          case "backtest":
            return "B";

          case "emulator":
            return "E";

          default:
            return "R";
        }
      };

      return "".concat(this._exchange, "/").concat(this._asset, "/").concat(this._currency, "/").concat(this._timeframe, "/").concat(this._taskId, ".").concat(modeToStr(this._mode));
    }
    /**
     * Генерация события NewSignal
     *
     * @param {*} signal
     * @memberof Adviser
     */

  }, {
    key: "advice",
    value: function advice(signal) {
      var newSignal = {
        id: Object(uuid__WEBPACK_IMPORTED_MODULE_5__["v4"])(),
        dataVersion: "1.0",
        eventTime: new Date(),
        subject: this._createSubject(),
        eventType: cpzEventTypes__WEBPACK_IMPORTED_MODULE_7__["SIGNALS_NEWSIGNAL_EVENT"].eventType,
        data: _babel_runtime_helpers_objectSpread__WEBPACK_IMPORTED_MODULE_2___default()({
          id: Object(uuid__WEBPACK_IMPORTED_MODULE_5__["v4"])(),
          robotId: this._robotId,
          advisorId: this._taskId,
          exchange: this._exchange,
          asset: this._asset,
          currency: this._currency
        }, signal)
      };

      this._signals.push(newSignal);
    }
    /**
     * Запрос текущих событий для отправки
     *
     * @memberof Adviser
     */

  }, {
    key: "getIndicatorsState",

    /**
     * Запрос текущего состояния индикаторов
     *
     * @memberof Adviser
     */
    value: function getIndicatorsState() {
      var _this5 = this;

      try {
        Object.keys(this._indicators).forEach(function (ind) {
          _this5._indicators[ind].initialized = _this5["_".concat(ind, "Instance")].initialized;
          _this5._indicators[ind].options = _this5["_".concat(ind, "Instance")].options; // Все свойства инстанса стратегии

          Object.keys(_this5["_".concat(ind, "Instance")]).filter(function (key) {
            return !key.startsWith("_");
          }) // публичные (не начинаются с "_")
          .forEach(function (key) {
            if (typeof _this5["_".concat(ind, "Instance")][key] !== "function") _this5._indicators[ind].variables[key] = _this5["_".concat(ind, "Instance")][key]; // сохраняем каждое свойство
          });
        });
      } catch (error) {
        throw new Error("Can't find indicators state for strategy \"".concat(this._strategyName, "\" \n").concat(error));
      }
    }
    /**
     * Запрос текущего состояния стратегии
     *
     * @memberof Adviser
     */

  }, {
    key: "getStrategyState",
    value: function getStrategyState() {
      var _this6 = this;

      try {
        this._strategy._initialized = this._strategyInstance.initialized; // Все свойства инстанса стратегии

        Object.keys(this._strategyInstance).filter(function (key) {
          return !key.startsWith("_");
        }) // публичные (не начинаются с "_")
        .forEach(function (key) {
          if (typeof _this6._strategyInstance[key] !== "function") _this6._strategy.variables[key] = _this6._strategyInstance[key]; // сохраняем каждое свойство
        });
      } catch (error) {
        throw new Error("Can't find strategy state \"".concat(this._strategyName, "\" \n").concat(error));
      }
    }
    /**
     * Запрос всего текущего состояния
     *
     * @returns {object}
     * @memberof Adviser
     */

  }, {
    key: "save",

    /**
     * Сохранение всего текущего состояния в локальное хранилище
     *
     * @memberof Adviser
     */
    value: function () {
      var _save = _babel_runtime_helpers_asyncToGenerator__WEBPACK_IMPORTED_MODULE_1___default()(
      /*#__PURE__*/
      _babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_0___default.a.mark(function _callee5() {
        var result;
        return _babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_0___default.a.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                this.log("save()"); // Сохраняем состояние в локальном хранилище

                _context5.next = 3;
                return Object(_tableStorage__WEBPACK_IMPORTED_MODULE_13__["saveAdviserState"])(this._context, this.currentState);

              case 3:
                result = _context5.sent;

                if (result.isSuccess) {
                  _context5.next = 6;
                  break;
                }

                throw new Error("Can't update state\n".concat(result.error));

              case 6:
              case "end":
                return _context5.stop();
            }
          }
        }, _callee5, this);
      }));

      return function save() {
        return _save.apply(this, arguments);
      };
    }()
    /**
     * Завершение работы итерации
     *
     * @param {*} status
     * @param {*} error
     * @memberof Adviser
     */

  }, {
    key: "end",
    value: function () {
      var _end = _babel_runtime_helpers_asyncToGenerator__WEBPACK_IMPORTED_MODULE_1___default()(
      /*#__PURE__*/
      _babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_0___default.a.mark(function _callee6(status, error) {
        return _babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_0___default.a.wrap(function _callee6$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                this.log("end()");
                this._status = status;
                this._error = error;
                this._updateRequested = false; // Обнуляем запрос на обновление параметров

                this._stopRequested = false; // Обнуляем запрос на остановку сервиса

                this._lastSignals = this._signals;
                this._lastCandle = this._candle;
                _context6.next = 9;
                return this.save();

              case 9:
              case "end":
                return _context6.stop();
            }
          }
        }, _callee6, this);
      }));

      return function end(_x3, _x4) {
        return _end.apply(this, arguments);
      };
    }()
  }, {
    key: "status",
    get: function get() {
      return this._status;
    }
    /**
     * Запрос текущего признака обновления параметров
     *
     * @returns updateRequested
     * @memberof Adviser
     */
    ,

    /**
     * Установка статуса сервиса
     *
     * @param {*} status
     * @memberof Adviser
     */
    set: function set(status) {
      if (status) this._status = status;
    }
  }, {
    key: "updateRequested",
    get: function get() {
      return this._updateRequested;
    }
  }, {
    key: "events",
    get: function get() {
      return this._signals;
    }
  }, {
    key: "currentState",
    get: function get() {
      this.getIndicatorsState();
      this.getStrategyState();
      return {
        eventSubject: this._eventSubject,
        taskId: this._taskId,
        robotId: this._robotId,
        mode: this._mode,
        debug: this._debug,
        settings: this._settings,
        exchange: this._exchange,
        asset: this._asset,
        currency: this._currency,
        timeframe: this._timeframe,
        lastCandle: this._lastCandle,
        lastSignals: this._lastSignals,
        strategyName: this._strategyName,
        strategy: this._strategy,
        indicators: this._indicators,
        updateRequested: this._updateRequested,
        stopRequested: this._stopRequested,
        status: this._status,
        startedAt: this._startedAt,
        endedAt: this._endedAt,
        initialized: this._initialized
      };
    }
  }]);

  return Adviser;
}();

/* harmony default export */ __webpack_exports__["default"] = (Adviser);

/***/ }),

/***/ "./src/adviser/baseIndicator.js":
/*!**************************************!*\
  !*** ./src/adviser/baseIndicator.js ***!
  \**************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/classCallCheck */ "@babel/runtime/helpers/classCallCheck");
/* harmony import */ var _babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @babel/runtime/helpers/createClass */ "@babel/runtime/helpers/createClass");
/* harmony import */ var _babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_1__);



var BaseIndicator =
/*#__PURE__*/
function () {
  function BaseIndicator(state) {
    var _this = this;

    _babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_0___default()(this, BaseIndicator);

    this._context = state.context; // текущий контекст выполнения

    this._name = state.name;
    this._indicatorName = state.indicatorName;
    this._initialized = state.initialized || false; // индикатор инициализирован

    this._exchange = state.exchange;
    this._asset = state.asset;
    this._currency = state.currency;
    this._timeframe = state.timeframe;
    this._options = state.options;
    this._candle = null;
    this._candles = [];
    this._candlesProps = {
      open: [],
      high: [],
      low: [],
      close: [],
      volume: []
    };
    this._tulipIndicators = state.tulipIndicators || {};
    this._log = state.log; // Функция логирования в консоль

    this._logEvent = state.logEvent; // Функция логирования в EventGrid в топик CPZ-LOGS

    if (state.variables) {
      Object.keys(state.variables).forEach(function (key) {
        _this[key] = state.variables[key];
      });
    }

    if (state.indicatorFunctions) {
      Object.getOwnPropertyNames(state.indicatorFunctions).forEach(function (key) {
        _this[key] = state.indicatorFunctions[key];
      });
    }
  }

  _babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_1___default()(BaseIndicator, [{
    key: "init",
    value: function init() {}
  }, {
    key: "calc",
    value: function calc() {}
  }, {
    key: "done",
    value: function done() {
      return Promise.resolve();
    }
  }, {
    key: "_handleCandle",
    value: function _handleCandle(candle, candles, candlesProps) {
      this._candle = candle;
      this._candles = candles;
      this._candlesProps = candlesProps;
    }
  }, {
    key: "handleCandle",
    get: function get() {
      return this._handleCandle;
    }
  }, {
    key: "initialized",
    get: function get() {
      return this._initialized;
    },
    set: function set(value) {
      this._initialized = value;
    }
  }, {
    key: "options",
    get: function get() {
      return this._options;
    }
  }, {
    key: "exchange",
    get: function get() {
      return this._exchange;
    }
  }, {
    key: "asset",
    get: function get() {
      return this._asset;
    }
  }, {
    key: "currency",
    get: function get() {
      return this._сurrency;
    }
  }, {
    key: "timeframe",
    get: function get() {
      return this._timeframe;
    }
  }, {
    key: "candle",
    get: function get() {
      return this._candle;
    }
  }, {
    key: "candles",
    get: function get() {
      return this._candles;
    }
  }, {
    key: "candlesProps",
    get: function get() {
      return this._candlesProps;
    }
  }, {
    key: "log",
    get: function get() {
      return this._log;
    }
  }, {
    key: "logEvent",
    get: function get() {
      return this._logEvent;
    }
  }]);

  return BaseIndicator;
}();

/* harmony default export */ __webpack_exports__["default"] = (BaseIndicator);

/***/ }),

/***/ "./src/adviser/baseStrategy.js":
/*!*************************************!*\
  !*** ./src/adviser/baseStrategy.js ***!
  \*************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/classCallCheck */ "@babel/runtime/helpers/classCallCheck");
/* harmony import */ var _babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @babel/runtime/helpers/createClass */ "@babel/runtime/helpers/createClass");
/* harmony import */ var _babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var cpzState__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! cpzState */ "../cpz-shared/config/state/index.js");




var BaseStrategy =
/*#__PURE__*/
function () {
  function BaseStrategy(state) {
    var _this = this;

    _babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_0___default()(this, BaseStrategy);

    this._context = state.context; // текущий контекст выполнения

    this._initialized = state.initialized || false; // стратегия инициализирована

    this._settings = state.settings;
    this._exchange = state.exchange;
    this._asset = state.asset;
    this._currency = state.currency;
    this._timeframe = state.timeframe;
    this._candle = null;
    this._indicators = state.indicators || {};
    this._advice = state.advice; // Генерация события NewSignal

    this._log = state.log; // Функция логирования в консоль

    this._logEvent = state.logEvent; // Функция логирования в EventGrid в топик CPZ-LOGS

    if (state.variables) {
      Object.keys(state.variables).forEach(function (key) {
        _this[key] = state.variables[key];
      });
    }

    if (state.strategyFunctions) {
      Object.getOwnPropertyNames(state.strategyFunctions).forEach(function (key) {
        _this._context.log(state.strategyFunctions[key]);

        _this[key] = state.strategyFunctions[key];
      });
    }
  }

  _babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_1___default()(BaseStrategy, [{
    key: "init",
    value: function init() {}
  }, {
    key: "check",
    value: function check() {}
  }, {
    key: "_handleCandle",
    value: function _handleCandle(candle, indicators) {
      var _this2 = this;

      this._candle = candle;
      this._indicators = indicators;
      Object.keys(this._indicators).forEach(function (key) {
        if (_this2._indicators[key].variables) Object.keys(_this2._indicators[key].variables).forEach(function (variable) {
          _this2._indicators[key][variable] = _this2._indicators[key].variables[variable];
        });
      });

      this._context.log(this._indicators);
    }
  }, {
    key: "_addIndicator",
    value: function _addIndicator(name, indicatorName, options) {
      this._indicators[name] = {};
      this._indicators[name].name = name;
      this._indicators[name].indicatorName = indicatorName;
      this._indicators[name].fileName = indicatorName;
      this._indicators[name].type = cpzState__WEBPACK_IMPORTED_MODULE_2__["INDICATORS_BASE"];
      this._indicators[name].options = options;
      this._indicators[name].variables = {};
    }
  }, {
    key: "_addTulipIndicator",
    value: function _addTulipIndicator(name, indicatorName, options) {
      this._addIndicator(name, indicatorName, options);

      this._indicators[name].type = cpzState__WEBPACK_IMPORTED_MODULE_2__["INDICATORS_TULIP"];
    }
  }, {
    key: "handleCandle",
    get: function get() {
      return this._handleCandle;
    }
  }, {
    key: "addIndicator",
    get: function get() {
      return this._addIndicator;
    }
  }, {
    key: "addTulipIndicator",
    get: function get() {
      return this._addTulipIndicator;
    }
  }, {
    key: "initialized",
    get: function get() {
      return this._initialized;
    },
    set: function set(value) {
      this._initialized = value;
    }
  }, {
    key: "settings",
    get: function get() {
      return this._settings;
    }
  }, {
    key: "exchange",
    get: function get() {
      return this._exchange;
    }
  }, {
    key: "asset",
    get: function get() {
      return this._asset;
    }
  }, {
    key: "currency",
    get: function get() {
      return this._сurrency;
    }
  }, {
    key: "timeframe",
    get: function get() {
      return this._timeframe;
    }
  }, {
    key: "candle",
    get: function get() {
      return this._candle;
    }
  }, {
    key: "indicators",
    get: function get() {
      return this._indicators;
    }
  }, {
    key: "advice",
    get: function get() {
      return this._advice;
    }
  }, {
    key: "log",
    get: function get() {
      return this._log;
    }
  }, {
    key: "logEvent",
    get: function get() {
      return this._logEvent;
    }
  }]);

  return BaseStrategy;
}();

/* harmony default export */ __webpack_exports__["default"] = (BaseStrategy);

/***/ }),

/***/ "./src/adviser/execute.js":
/*!********************************!*\
  !*** ./src/adviser/execute.js ***!
  \********************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/regenerator */ "@babel/runtime/regenerator");
/* harmony import */ var _babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _babel_runtime_helpers_asyncToGenerator__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @babel/runtime/helpers/asyncToGenerator */ "@babel/runtime/helpers/asyncToGenerator");
/* harmony import */ var _babel_runtime_helpers_asyncToGenerator__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_babel_runtime_helpers_asyncToGenerator__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var cpzState__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! cpzState */ "../cpz-shared/config/state/index.js");
/* harmony import */ var _adviser__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./adviser */ "./src/adviser/adviser.js");
/* harmony import */ var _eventgrid__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../eventgrid */ "./src/eventgrid/index.js");





/**
 * Основная задача советника
 *
 * @param {*} context
 * @param {*} state
 * @param {*} candle
 */

function execute(_x, _x2, _x3) {
  return _execute.apply(this, arguments);
}

function _execute() {
  _execute = _babel_runtime_helpers_asyncToGenerator__WEBPACK_IMPORTED_MODULE_1___default()(
  /*#__PURE__*/
  _babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_0___default.a.mark(function _callee(context, state, candle) {
    var adviser, publishEventsResult;
    return _babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_0___default.a.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            context.log("execute");
            _context.prev = 1;
            // Создаем экземпляр класса Adviser
            adviser = new _adviser__WEBPACK_IMPORTED_MODULE_3__["default"](context, state); // Если задача остановлена

            if (!(adviser.status === cpzState__WEBPACK_IMPORTED_MODULE_2__["STATUS_STOPPED"] || adviser.status === cpzState__WEBPACK_IMPORTED_MODULE_2__["STATUS_ERROR"])) {
              _context.next = 6;
              break;
            }

            // Сохраняем состояние и завершаем работу
            adviser.end(adviser.status);
            return _context.abrupt("return", {
              isSuccess: true,
              taskId: state.taskId
            });

          case 6:
            // Если есть запрос на обновление параметров
            if (adviser.updateRequested) {
              // Обновляем параметры
              adviser.setUpdate();
            } // Устанавливаем статус "Занят"


            adviser.status = cpzState__WEBPACK_IMPORTED_MODULE_2__["STATUS_BUSY"];
            _context.next = 10;
            return adviser.save();

          case 10:
            _context.next = 12;
            return adviser.handleCandle(candle);

          case 12:
            if (!(adviser.events.length > 0)) {
              _context.next = 18;
              break;
            }

            _context.next = 15;
            return Object(_eventgrid__WEBPACK_IMPORTED_MODULE_4__["publishEvents"])(context, "signals", adviser.events);

          case 15:
            publishEventsResult = _context.sent;

            if (publishEventsResult.isSuccess) {
              _context.next = 18;
              break;
            }

            throw publishEventsResult;

          case 18:
            _context.next = 20;
            return adviser.end(cpzState__WEBPACK_IMPORTED_MODULE_2__["STATUS_STARTED"]);

          case 20:
            _context.next = 22;
            return adviser.logEvent(adviser.currentState);

          case 22:
            return _context.abrupt("return", {
              isSuccess: true,
              taskId: state.taskId
            });

          case 25:
            _context.prev = 25;
            _context.t0 = _context["catch"](1);
            context.log.error(_context.t0, state.taskId); // Если есть экземпляр класса

            if (!adviser) {
              _context.next = 31;
              break;
            }

            _context.next = 31;
            return adviser.end(cpzState__WEBPACK_IMPORTED_MODULE_2__["STATUS_STARTED"], _context.t0);

          case 31:
            return _context.abrupt("return", {
              isSuccess: false,
              taskId: state.taskId,
              error: _context.t0.message
            });

          case 32:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, this, [[1, 25]]);
  }));
  return _execute.apply(this, arguments);
}

/* harmony default export */ __webpack_exports__["default"] = (execute);

/***/ }),

/***/ "./src/adviser/handleEvents.js":
/*!*************************************!*\
  !*** ./src/adviser/handleEvents.js ***!
  \*************************************/
/*! exports provided: handleStart, handleStop, handleUpdate, handleCandle */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "handleStart", function() { return handleStart; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "handleStop", function() { return handleStop; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "handleUpdate", function() { return handleUpdate; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "handleCandle", function() { return handleCandle; });
/* harmony import */ var _babel_runtime_helpers_objectSpread__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/objectSpread */ "@babel/runtime/helpers/objectSpread");
/* harmony import */ var _babel_runtime_helpers_objectSpread__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_babel_runtime_helpers_objectSpread__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @babel/runtime/regenerator */ "@babel/runtime/regenerator");
/* harmony import */ var _babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _babel_runtime_helpers_asyncToGenerator__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @babel/runtime/helpers/asyncToGenerator */ "@babel/runtime/helpers/asyncToGenerator");
/* harmony import */ var _babel_runtime_helpers_asyncToGenerator__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_babel_runtime_helpers_asyncToGenerator__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var dayjs__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! dayjs */ "dayjs");
/* harmony import */ var dayjs__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(dayjs__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var cpzEventTypes__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! cpzEventTypes */ "../cpz-shared/config/eventTypes/index.js");
/* harmony import */ var cpzState__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! cpzState */ "../cpz-shared/config/state/index.js");
/* harmony import */ var _adviser__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./adviser */ "./src/adviser/adviser.js");
/* harmony import */ var _tableStorage__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../tableStorage */ "./src/tableStorage/index.js");
/* harmony import */ var _eventgrid__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../eventgrid */ "./src/eventgrid/index.js");
/* harmony import */ var _tableStorage_utils__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../tableStorage/utils */ "./src/tableStorage/utils.js");
/* harmony import */ var _execute__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./execute */ "./src/adviser/execute.js");











/**
 * Запуск нового советника
 *
 * @param {*} context
 * @param {*} eventData
 */

function handleStart(_x, _x2) {
  return _handleStart.apply(this, arguments);
}
/**
 * Остановка советника
 *
 * @param {*} context
 * @param {*} eventData
 */


function _handleStart() {
  _handleStart = _babel_runtime_helpers_asyncToGenerator__WEBPACK_IMPORTED_MODULE_2___default()(
  /*#__PURE__*/
  _babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_1___default.a.mark(function _callee(context, eventData) {
    var adviser;
    return _babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_1___default.a.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.prev = 0;
            // Инициализируем класс советника
            adviser = new _adviser__WEBPACK_IMPORTED_MODULE_6__["default"](context, eventData); // Сохраняем состояние

            adviser.end(cpzState__WEBPACK_IMPORTED_MODULE_5__["STATUS_STARTED"]); // Публикуем событие - успех

            _context.next = 5;
            return Object(_eventgrid__WEBPACK_IMPORTED_MODULE_8__["publishEvents"])(context, "tasks", Object(_eventgrid__WEBPACK_IMPORTED_MODULE_8__["createEvents"])({
              subject: eventData.eventSubject,
              eventType: cpzEventTypes__WEBPACK_IMPORTED_MODULE_4__["TASKS_ADVISER_STARTED_EVENT"].eventType,
              data: {
                taskId: eventData.taskId,
                rowKey: eventData.taskId,
                partitionKey: Object(_tableStorage_utils__WEBPACK_IMPORTED_MODULE_9__["createSlug"])(eventData.exchange, eventData.asset, eventData.currency, eventData.timeframe)
              }
            }));

          case 5:
            _context.next = 12;
            break;

          case 7:
            _context.prev = 7;
            _context.t0 = _context["catch"](0);
            context.log.error("Adviser starting error:", _context.t0, eventData); // Публикуем событие - ошибка

            _context.next = 12;
            return Object(_eventgrid__WEBPACK_IMPORTED_MODULE_8__["publishEvents"])(context, "tasks", Object(_eventgrid__WEBPACK_IMPORTED_MODULE_8__["createEvents"])({
              subject: eventData.eventSubject,
              eventType: cpzEventTypes__WEBPACK_IMPORTED_MODULE_4__["TASKS_ADVISER_STARTED_EVENT"].eventType,
              data: {
                taskId: eventData.taskId,
                error: _context.t0
              }
            }));

          case 12:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, this, [[0, 7]]);
  }));
  return _handleStart.apply(this, arguments);
}

function handleStop(_x3, _x4) {
  return _handleStop.apply(this, arguments);
}
/**
 * Обновление параметров советника
 *
 * @param {*} context
 * @param {*} eventData
 */


function _handleStop() {
  _handleStop = _babel_runtime_helpers_asyncToGenerator__WEBPACK_IMPORTED_MODULE_2___default()(
  /*#__PURE__*/
  _babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_1___default.a.mark(function _callee2(context, eventData) {
    var getAdviserResult, adviserState, newState, result;
    return _babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_1___default.a.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.prev = 0;
            _context2.next = 3;
            return Object(_tableStorage__WEBPACK_IMPORTED_MODULE_7__["getAdviserByKey"])(context, {
              rowKey: eventData.rowKey,
              partitionKey: eventData.partitionKey
            });

          case 3:
            getAdviserResult = _context2.sent;

            if (getAdviserResult.isSuccess) {
              _context2.next = 6;
              break;
            }

            throw getAdviserResult;

          case 6:
            // Текущее состояние советника
            adviserState = getAdviserResult.data; // Генерируем новое состояние

            newState = {
              RowKey: eventData.rowKey,
              PartitionKey: eventData.partitionKey
            }; // Если занят

            if (adviserState.status === cpzState__WEBPACK_IMPORTED_MODULE_5__["STATUS_BUSY"]) {
              // Создаем запрос на завершение при следующей итерации
              newState.stopRequested = true;
            } else {
              // Помечаем как остановленный
              newState.status = cpzState__WEBPACK_IMPORTED_MODULE_5__["STATUS_STOPPED"];
              newState.endedAt = dayjs__WEBPACK_IMPORTED_MODULE_3___default()().toJSON();
            } // Обновляем состояние советника


            _context2.next = 11;
            return Object(_tableStorage__WEBPACK_IMPORTED_MODULE_7__["updateAdviserState"])(context, newState);

          case 11:
            result = _context2.sent;

            if (result.isSuccess) {
              _context2.next = 14;
              break;
            }

            throw new Error("Can't update state\n".concat(result.error));

          case 14:
            _context2.next = 16;
            return Object(_eventgrid__WEBPACK_IMPORTED_MODULE_8__["publishEvents"])(context, "tasks", Object(_eventgrid__WEBPACK_IMPORTED_MODULE_8__["createEvents"])({
              subject: eventData.eventSubject,
              eventType: cpzEventTypes__WEBPACK_IMPORTED_MODULE_4__["TASKS_ADVISER_STOPPED_EVENT"].eventType,
              data: {
                taskId: eventData.taskId
              }
            }));

          case 16:
            _context2.next = 23;
            break;

          case 18:
            _context2.prev = 18;
            _context2.t0 = _context2["catch"](0);
            context.log.error("Adviser stopping error:", _context2.t0, eventData); // Публикуем событие - ошибка

            _context2.next = 23;
            return Object(_eventgrid__WEBPACK_IMPORTED_MODULE_8__["publishEvents"])(context, "tasks", Object(_eventgrid__WEBPACK_IMPORTED_MODULE_8__["createEvents"])({
              subject: eventData.eventSubject,
              eventType: cpzEventTypes__WEBPACK_IMPORTED_MODULE_4__["TASKS_ADVISER_STOPPED_EVENT"].eventType,
              data: {
                taskId: eventData.taskId,
                error: _context2.t0
              }
            }));

          case 23:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2, this, [[0, 18]]);
  }));
  return _handleStop.apply(this, arguments);
}

function handleUpdate(_x5, _x6) {
  return _handleUpdate.apply(this, arguments);
}
/**
 * Обработка новой свечи
 *
 * @param {*} context
 * @param {*} candle
 */


function _handleUpdate() {
  _handleUpdate = _babel_runtime_helpers_asyncToGenerator__WEBPACK_IMPORTED_MODULE_2___default()(
  /*#__PURE__*/
  _babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_1___default.a.mark(function _callee3(context, eventData) {
    var getCandlebatcherResult, candlebatcherState, newState, result;
    return _babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_1___default.a.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            _context3.prev = 0;
            _context3.next = 3;
            return Object(_tableStorage__WEBPACK_IMPORTED_MODULE_7__["getAdviserByKey"])(context, eventData);

          case 3:
            getCandlebatcherResult = _context3.sent;

            if (!getCandlebatcherResult.isSuccess) {
              _context3.next = 17;
              break;
            }

            candlebatcherState = getCandlebatcherResult.data;
            newState = {
              RowKey: eventData.rowKey,
              PartitionKey: eventData.partitionKey
            }; // Если занят

            if (candlebatcherState.status === cpzState__WEBPACK_IMPORTED_MODULE_5__["STATUS_BUSY"]) {
              newState.updateRequested = {
                eventSubject: eventData.eventSubject,
                debug: eventData.debug,
                settings: eventData.settings,
                requiredHistoryCache: eventData.requiredHistoryCache,
                requiredHistoryMaxBars: eventData.requiredHistoryMaxBars
              };
            } else {
              newState.eventSubject = eventData.eventSubject;
              newState.debug = eventData.debug;
              newState.settings = eventData.settings;
              newState.requiredHistoryCache = eventData.requiredHistoryCache;
              newState.requiredHistoryMaxBars = eventData.requiredHistoryMaxBars;
            }

            _context3.next = 10;
            return Object(_tableStorage__WEBPACK_IMPORTED_MODULE_7__["updateAdviserState"])(context, newState);

          case 10:
            result = _context3.sent;

            if (result.isSuccess) {
              _context3.next = 13;
              break;
            }

            throw new Error("Can't update state\n".concat(result.error));

          case 13:
            _context3.next = 15;
            return Object(_eventgrid__WEBPACK_IMPORTED_MODULE_8__["publishEvents"])(context, "tasks", Object(_eventgrid__WEBPACK_IMPORTED_MODULE_8__["createEvents"])({
              subject: eventData.eventSubject,
              eventType: cpzEventTypes__WEBPACK_IMPORTED_MODULE_4__["TASKS_ADVISER_UPDATED_EVENT"].eventType,
              data: {
                taskId: eventData.taskId
              }
            }));

          case 15:
            _context3.next = 18;
            break;

          case 17:
            throw getCandlebatcherResult;

          case 18:
            _context3.next = 25;
            break;

          case 20:
            _context3.prev = 20;
            _context3.t0 = _context3["catch"](0);
            context.log.error("Adviser updating error:", _context3.t0, eventData); // Публикуем событие - ошибка

            _context3.next = 25;
            return Object(_eventgrid__WEBPACK_IMPORTED_MODULE_8__["publishEvents"])(context, "tasks", Object(_eventgrid__WEBPACK_IMPORTED_MODULE_8__["createEvents"])({
              subject: eventData.eventSubject,
              eventType: cpzEventTypes__WEBPACK_IMPORTED_MODULE_4__["TASKS_ADVISER_UPDATED_EVENT"].eventType,
              data: {
                taskId: eventData.taskId,
                error: _context3.t0
              }
            }));

          case 25:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3, this, [[0, 20]]);
  }));
  return _handleUpdate.apply(this, arguments);
}

function handleCandle(_x7, _x8) {
  return _handleCandle.apply(this, arguments);
}

function _handleCandle() {
  _handleCandle = _babel_runtime_helpers_asyncToGenerator__WEBPACK_IMPORTED_MODULE_2___default()(
  /*#__PURE__*/
  _babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_1___default.a.mark(function _callee6(context, data) {
    var candle, slug, getAdvisersResult, advisers, startedAdvisers, busyAdvisers, adviserExecutionResults, pendingCandlesResults, successAdvisers, errorAdvisers, successPendingAdvisers, errorPendingAdvisers;
    return _babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_1___default.a.wrap(function _callee6$(_context6) {
      while (1) {
        switch (_context6.prev = _context6.next) {
          case 0:
            _context6.prev = 0;
            candle = data.candle; // Параметры запроса - биржа + инструмент + таймфрейм

            slug = Object(_tableStorage_utils__WEBPACK_IMPORTED_MODULE_9__["createSlug"])(candle.exchange, candle.asset, candle.currency, candle.timeframe); // Ищем подходящих советников

            _context6.next = 5;
            return Object(_tableStorage__WEBPACK_IMPORTED_MODULE_7__["getAdvisersBySlug"])(context, slug);

          case 5:
            getAdvisersResult = _context6.sent;

            if (getAdvisersResult.isSuccess) {
              _context6.next = 8;
              break;
            }

            throw getAdvisersResult;

          case 8:
            // Все подходящие советники
            advisers = getAdvisersResult.data; // Фильтруем только доступные советники

            startedAdvisers = advisers.filter(function (adviser) {
              return adviser.status === cpzState__WEBPACK_IMPORTED_MODULE_5__["STATUS_STARTED"];
            }); // Фильтруем только занятые советники

            busyAdvisers = advisers.filter(function (adviser) {
              return adviser.status === cpzState__WEBPACK_IMPORTED_MODULE_5__["STATUS_BUSY"];
            }); // Запускаем параллельно всех доступных советников в работу

            _context6.next = 13;
            return Promise.all(startedAdvisers.map(
            /*#__PURE__*/
            function () {
              var _ref = _babel_runtime_helpers_asyncToGenerator__WEBPACK_IMPORTED_MODULE_2___default()(
              /*#__PURE__*/
              _babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_1___default.a.mark(function _callee4(state) {
                var result;
                return _babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_1___default.a.wrap(function _callee4$(_context4) {
                  while (1) {
                    switch (_context4.prev = _context4.next) {
                      case 0:
                        _context4.next = 2;
                        return Object(_execute__WEBPACK_IMPORTED_MODULE_10__["default"])(context, state, candle);

                      case 2:
                        result = _context4.sent;
                        return _context4.abrupt("return", result);

                      case 4:
                      case "end":
                        return _context4.stop();
                    }
                  }
                }, _callee4, this);
              }));

              return function (_x9) {
                return _ref.apply(this, arguments);
              };
            }()));

          case 13:
            adviserExecutionResults = _context6.sent;
            _context6.next = 16;
            return Promise.all(busyAdvisers.map(
            /*#__PURE__*/
            function () {
              var _ref2 = _babel_runtime_helpers_asyncToGenerator__WEBPACK_IMPORTED_MODULE_2___default()(
              /*#__PURE__*/
              _babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_1___default.a.mark(function _callee5(state) {
                var newPendingCandle, result;
                return _babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_1___default.a.wrap(function _callee5$(_context5) {
                  while (1) {
                    switch (_context5.prev = _context5.next) {
                      case 0:
                        newPendingCandle = _babel_runtime_helpers_objectSpread__WEBPACK_IMPORTED_MODULE_0___default()({}, candle, {
                          taskId: state.taskId
                        });
                        _context5.next = 3;
                        return Object(_tableStorage__WEBPACK_IMPORTED_MODULE_7__["savePendingCandles"])(context, newPendingCandle);

                      case 3:
                        result = _context5.sent;
                        return _context5.abrupt("return", result);

                      case 5:
                      case "end":
                        return _context5.stop();
                    }
                  }
                }, _callee5, this);
              }));

              return function (_x10) {
                return _ref2.apply(this, arguments);
              };
            }()));

          case 16:
            pendingCandlesResults = _context6.sent;
            // Отбираем из результата выполнения только успешные
            successAdvisers = adviserExecutionResults.filter(function (result) {
              return result.isSuccess === true;
            }).map(function (result) {
              return result.taskId;
            }); // Отбираем из результата выполнения только не успешные

            errorAdvisers = adviserExecutionResults.filter(function (result) {
              return result.isSuccess === false;
            }).map(function (result) {
              return {
                taskId: result.taskId,
                error: result.error
              };
            }); // TODO: обработать ошибки вставки в сторедж и отправить свечи в очередь
            // Отбираем из результата выполнения только успешные

            successPendingAdvisers = pendingCandlesResults.filter(function (result) {
              return result.isSuccess === true;
            }).map(function (result) {
              return result.taskId;
            }); // Отбираем из результата выполнения только не успешные

            errorPendingAdvisers = pendingCandlesResults.filter(function (result) {
              return result.isSuccess === false;
            }).map(function (result) {
              return {
                taskId: result.taskId,
                error: result.error
              };
            }); // Публикуем событие - успех

            _context6.next = 23;
            return Object(_eventgrid__WEBPACK_IMPORTED_MODULE_8__["publishEvents"])(context, "tasks", Object(_eventgrid__WEBPACK_IMPORTED_MODULE_8__["createEvents"])({
              subject: "".concat(candle.exchange, "/").concat(candle.asset, "/").concat(candle.currency, "/").concat(candle.timeframe),
              eventType: cpzEventTypes__WEBPACK_IMPORTED_MODULE_4__["CANDLES_HANDLED_EVENT"].eventType,
              data: {
                candleId: candle.candleId,
                successAdvisers: successAdvisers,
                errorAdvisers: errorAdvisers,
                successPendingAdvisers: successPendingAdvisers,
                errorPendingAdvisers: errorPendingAdvisers
              }
            }));

          case 23:
            _context6.next = 30;
            break;

          case 25:
            _context6.prev = 25;
            _context6.t0 = _context6["catch"](0);
            context.log.error("Handle candle error:", _context6.t0, data); // Публикуем событие - ошибка

            _context6.next = 30;
            return Object(_eventgrid__WEBPACK_IMPORTED_MODULE_8__["publishEvents"])(context, "log", Object(_eventgrid__WEBPACK_IMPORTED_MODULE_8__["createEvents"])({
              subject: "Candle",
              eventType: cpzEventTypes__WEBPACK_IMPORTED_MODULE_4__["ERROR_ADVISER_EVENT"].eventType,
              data: {
                candleId: data.candle.id,
                error: _context6.t0
              }
            }));

          case 30:
          case "end":
            return _context6.stop();
        }
      }
    }, _callee6, this, [[0, 25]]);
  }));
  return _handleCandle.apply(this, arguments);
}



/***/ }),

/***/ "./src/eventgrid/index.js":
/*!********************************!*\
  !*** ./src/eventgrid/index.js ***!
  \********************************/
/*! exports provided: publishEvents, createEvents */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "publishEvents", function() { return publishEvents; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "createEvents", function() { return createEvents; });
/* harmony import */ var _babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/regenerator */ "@babel/runtime/regenerator");
/* harmony import */ var _babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _babel_runtime_helpers_asyncToGenerator__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @babel/runtime/helpers/asyncToGenerator */ "@babel/runtime/helpers/asyncToGenerator");
/* harmony import */ var _babel_runtime_helpers_asyncToGenerator__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_babel_runtime_helpers_asyncToGenerator__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _babel_runtime_helpers_objectSpread__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @babel/runtime/helpers/objectSpread */ "@babel/runtime/helpers/objectSpread");
/* harmony import */ var _babel_runtime_helpers_objectSpread__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_babel_runtime_helpers_objectSpread__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var ms_rest_azure__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ms-rest-azure */ "ms-rest-azure");
/* harmony import */ var ms_rest_azure__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(ms_rest_azure__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var azure_eventgrid__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! azure-eventgrid */ "azure-eventgrid");
/* harmony import */ var azure_eventgrid__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(azure_eventgrid__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var url__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! url */ "url");
/* harmony import */ var url__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(url__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var uuid__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! uuid */ "uuid");
/* harmony import */ var uuid__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(uuid__WEBPACK_IMPORTED_MODULE_6__);
/* harmony import */ var cpzServices__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! cpzServices */ "../cpz-shared/config/services/index.js");




/*
 * Публикация свечей в топик EventGrid в различных таймфремах
 */






function createClient(key) {
  return new azure_eventgrid__WEBPACK_IMPORTED_MODULE_4___default.a(new ms_rest_azure__WEBPACK_IMPORTED_MODULE_3___default.a.TopicCredentials(key));
}

function getHost(endpoint) {
  return url__WEBPACK_IMPORTED_MODULE_5___default.a.parse(endpoint, true).host;
}

var topics = {
  tasks: {
    client: createClient(process.env.EG_TASKS_KEY || process.env.EG_TEST_KEY),
    host: getHost(process.env.EG_TASKS_ENDPOINT || process.env.EG_TEST_ENDPOINT)
  },
  candles: {
    client: createClient(process.env.EG_CANDLES_KEY || process.env.EG_TEST_KEY),
    host: getHost(process.env.EG_CANDLES_ENDPOINT || process.env.EG_TEST_ENDPOINT)
  },
  signals: {
    client: createClient(process.env.EG_SIGNALS_KEY || process.env.EG_TEST_KEY),
    host: getHost(process.env.EG_SIGNALS_ENDPOINT || process.env.EG_TEST_ENDPOINT)
  },
  log: {
    client: createClient(process.env.EG_LOG_KEY || process.env.EG_TEST_KEY),
    host: getHost(process.env.EG_LOG_ENDPOINT || process.env.EG_TEST_ENDPOINT)
  }
};

function createEvents(eventData) {
  var events = [];

  var data = _babel_runtime_helpers_objectSpread__WEBPACK_IMPORTED_MODULE_2___default()({
    service: cpzServices__WEBPACK_IMPORTED_MODULE_7__["ADVISER_SERVICE"]
  }, eventData.data);

  var newEvent = {
    id: Object(uuid__WEBPACK_IMPORTED_MODULE_6__["v4"])(),
    dataVersion: "1.0",
    eventTime: new Date(),
    subject: eventData.subject,
    eventType: eventData.eventType,
    data: data
  };
  events.push(newEvent);
  return events;
}

function publishEvents(_x, _x2, _x3) {
  return _publishEvents.apply(this, arguments);
}

function _publishEvents() {
  _publishEvents = _babel_runtime_helpers_asyncToGenerator__WEBPACK_IMPORTED_MODULE_1___default()(
  /*#__PURE__*/
  _babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_0___default.a.mark(function _callee(context, topic, events) {
    var _topics$topic, client, host;

    return _babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_0___default.a.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.prev = 0;
            _topics$topic = topics[topic], client = _topics$topic.client, host = _topics$topic.host;
            _context.next = 4;
            return client.publishEvents(host, events);

          case 4:
            return _context.abrupt("return", {
              isSuccess: true
            });

          case 7:
            _context.prev = 7;
            _context.t0 = _context["catch"](0);
            context.log.error(_context.t0);
            return _context.abrupt("return", {
              isSuccess: false,
              topic: topic,
              events: events,
              error: _context.t0
            });

          case 11:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, this, [[0, 7]]);
  }));
  return _publishEvents.apply(this, arguments);
}



/***/ }),

/***/ "./src/funcs/funcTaskEvents.js":
/*!*************************************!*\
  !*** ./src/funcs/funcTaskEvents.js ***!
  \*************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _babel_runtime_helpers_objectSpread__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/objectSpread */ "@babel/runtime/helpers/objectSpread");
/* harmony import */ var _babel_runtime_helpers_objectSpread__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_babel_runtime_helpers_objectSpread__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var cpzEventTypes__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! cpzEventTypes */ "../cpz-shared/config/eventTypes/index.js");
/* harmony import */ var _adviser_handleEvents__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../adviser/handleEvents */ "./src/adviser/handleEvents.js");




function eventHandler(context, req) {
  var parsedReq = JSON.parse(req.rawBody);
  context.log.info("CPZ Adviser processed a request.".concat(JSON.stringify(parsedReq))); // TODO: SENDER ENDPOINT VALIDATION
  // check req.originalUrl

  parsedReq.forEach(function (eventGridEvent) {
    var eventData = eventGridEvent.data;
    var eventSubject = eventGridEvent.subject;

    switch (eventGridEvent.eventType) {
      case cpzEventTypes__WEBPACK_IMPORTED_MODULE_1__["SUB_VALIDATION_EVENT"].eventType:
        {
          context.log.warn("Got SubscriptionValidation event data, validationCode: ".concat(eventData.validationCode, ", topic: ").concat(eventGridEvent.topic));
          context.res = {
            status: 200,
            body: {
              validationResponse: eventData.validationCode
            },
            headers: {
              "Content-Type": "application/json"
            }
          };
          break;
        }

      case cpzEventTypes__WEBPACK_IMPORTED_MODULE_1__["TASKS_ADVISER_START_EVENT"].eventType:
        {
          context.log.info("Got ".concat(eventGridEvent.eventType, " event data ").concat(JSON.stringify(eventData)));
          Object(_adviser_handleEvents__WEBPACK_IMPORTED_MODULE_2__["handleStart"])(context, _babel_runtime_helpers_objectSpread__WEBPACK_IMPORTED_MODULE_0___default()({
            eventSubject: eventSubject
          }, eventData));
          break;
        }

      case cpzEventTypes__WEBPACK_IMPORTED_MODULE_1__["TASKS_ADVISER_STOP_EVENT"].eventType:
        {
          context.log.info("Got ".concat(eventGridEvent.eventType, " event data ").concat(JSON.stringify(eventData)));
          Object(_adviser_handleEvents__WEBPACK_IMPORTED_MODULE_2__["handleStop"])(context, _babel_runtime_helpers_objectSpread__WEBPACK_IMPORTED_MODULE_0___default()({
            eventSubject: eventSubject
          }, eventData));
          break;
        }

      case cpzEventTypes__WEBPACK_IMPORTED_MODULE_1__["TASKS_ADVISER_UPDATE_EVENT"].eventType:
        {
          context.log.info("Got ".concat(eventGridEvent.eventType, " event data ").concat(JSON.stringify(eventData)));
          Object(_adviser_handleEvents__WEBPACK_IMPORTED_MODULE_2__["handleUpdate"])(context, _babel_runtime_helpers_objectSpread__WEBPACK_IMPORTED_MODULE_0___default()({
            eventSubject: eventSubject
          }, eventData));
          break;
        }

      default:
        {
          context.log.error("Unknown Event Type: ".concat(eventGridEvent.eventType));
        }
    }
  });
  context.res = {
    status: 200
  };
  context.done();
}

/* harmony default export */ __webpack_exports__["default"] = (eventHandler);

/***/ }),

/***/ "./src/indicators sync recursive ^\\.\\/.*$":
/*!**************************************!*\
  !*** ./src/indicators sync ^\.\/.*$ ***!
  \**************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var map = {
	"./EMA": "./src/indicators/EMA.js",
	"./EMA.js": "./src/indicators/EMA.js"
};


function webpackContext(req) {
	var id = webpackContextResolve(req);
	return __webpack_require__(id);
}
function webpackContextResolve(req) {
	var id = map[req];
	if(!(id + 1)) { // check for number or string
		var e = new Error("Cannot find module '" + req + "'");
		e.code = 'MODULE_NOT_FOUND';
		throw e;
	}
	return id;
}
webpackContext.keys = function webpackContextKeys() {
	return Object.keys(map);
};
webpackContext.resolve = webpackContextResolve;
module.exports = webpackContext;
webpackContext.id = "./src/indicators sync recursive ^\\.\\/.*$";

/***/ }),

/***/ "./src/indicators/EMA.js":
/*!*******************************!*\
  !*** ./src/indicators/EMA.js ***!
  \*******************************/
/*! no static exports found */
/***/ (function(module, exports) {

var EMA = {
  init: function init() {
    this.input = "price";
    this.weight = this.options.weight;
    this.result = false;
    this.age = 0;
  },
  calc: function calc() {
    this.log("calc");
    this.price = this.candle.close; // The first time we can't calculate based on previous
    // ema, because we haven't calculated any yet.

    if (this.result === false) this.result = this.price;
    this.age += 1; // weight factor

    var k = 2 / (this.weight + 1); // yesterday

    var y = this.result; // calculation

    this.result = this.price * k + y * (1 - k);
    this.log(this.result);
  }
};
module.exports = EMA;

/***/ }),

/***/ "./src/lib/tulip/create.js":
/*!*********************************!*\
  !*** ./src/lib/tulip/create.js ***!
  \*********************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/regenerator */ "@babel/runtime/regenerator");
/* harmony import */ var _babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _babel_runtime_helpers_asyncToGenerator__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @babel/runtime/helpers/asyncToGenerator */ "@babel/runtime/helpers/asyncToGenerator");
/* harmony import */ var _babel_runtime_helpers_asyncToGenerator__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_babel_runtime_helpers_asyncToGenerator__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var tulind__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! tulind */ "tulind");
/* harmony import */ var tulind__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(tulind__WEBPACK_IMPORTED_MODULE_2__);



/* from https://github.com/askmike/gekko/ */


function isNumeric(obj) {
  return !Array.isArray(obj) && obj - parseFloat(obj) + 1 >= 0;
}

var methods = {}; // Wrapper that executes a tulip indicator

function execute(_x) {
  return _execute.apply(this, arguments);
} // Helper that makes sure all required parameters
// for a specific talib indicator are present.


function _execute() {
  _execute = _babel_runtime_helpers_asyncToGenerator__WEBPACK_IMPORTED_MODULE_1___default()(
  /*#__PURE__*/
  _babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_0___default.a.mark(function _callee(params) {
    var result, results, i, arr;
    return _babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_0___default.a.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.prev = 0;
            _context.next = 3;
            return params.indicator.indicator(params.inputs, params.options);

          case 3:
            result = _context.sent;
            results = {};

            for (i = 0; i < params.results.length; i += 1) {
              if (Array.isArray(result[i])) {
                arr = result[i];
                results[params.results[i]] = arr[arr.length - 1];
              } else {
                results[params.results[i]] = result[i];
              }
            }

            return _context.abrupt("return", results);

          case 9:
            _context.prev = 9;
            _context.t0 = _context["catch"](0);
            throw _context.t0;

          case 12:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, this, [[0, 9]]);
  }));
  return _execute.apply(this, arguments);
}

var verifyParams = function verifyParams(methodName, params) {
  var requiredParams = methods[methodName].requires;
  requiredParams.forEach(function (paramName) {
    if (!Object.prototype.hasOwnProperty.call(params, paramName)) {
      throw new Error("Can't configure tulip ".concat(methodName, " requires ").concat(paramName, "."));
    }

    var val = params[paramName];

    if (!isNumeric(val)) {
      throw new Error("Can't configure tulip ".concat(methodName, " - ").concat(paramName, " needs to be a number"));
    }
  });
};

methods.ad = {
  requires: [],
  create: function create(params) {
    verifyParams("ad", params);
    return function (data) {
      return execute({
        indicator: tulind__WEBPACK_IMPORTED_MODULE_2___default.a.indicators.ad,
        inputs: [data.high, data.low, data.close, data.volume],
        options: [],
        results: ["result"]
      });
    };
  }
};
methods.adosc = {
  requires: ["optInFastPeriod", "optInSlowPeriod"],
  create: function create(params) {
    verifyParams("adosc", params);
    return function (data) {
      return execute({
        indicator: tulind__WEBPACK_IMPORTED_MODULE_2___default.a.indicators.adosc,
        inputs: [data.high, data.low, data.close, data.volume],
        options: [params.optInFastPeriod, params.optInSlowPeriod],
        results: ["result"]
      });
    };
  }
};
methods.adx = {
  requires: ["optInTimePeriod"],
  create: function create(params) {
    verifyParams("adx", params);
    return function (data) {
      return execute({
        indicator: tulind__WEBPACK_IMPORTED_MODULE_2___default.a.indicators.adx,
        inputs: [data.high, data.low, data.close],
        options: [params.optInTimePeriod],
        results: ["result"]
      });
    };
  }
};
methods.adxr = {
  requires: ["optInTimePeriod"],
  create: function create(params) {
    verifyParams("adxr", params);
    return function (data) {
      return execute({
        indicator: tulind__WEBPACK_IMPORTED_MODULE_2___default.a.indicators.adxr,
        inputs: [data.high, data.low, data.close],
        options: [params.optInTimePeriod],
        results: ["result"]
      });
    };
  }
};
methods.ao = {
  requires: [],
  create: function create(params) {
    verifyParams("ao", params);
    return function (data) {
      return execute({
        indicator: tulind__WEBPACK_IMPORTED_MODULE_2___default.a.indicators.ao,
        inputs: [data.high, data.low],
        options: [],
        results: ["result"]
      });
    };
  }
};
methods.apo = {
  requires: ["optInFastPeriod", "optInSlowPeriod"],
  create: function create(params) {
    verifyParams("apo", params);
    return function (data) {
      return execute({
        indicator: tulind__WEBPACK_IMPORTED_MODULE_2___default.a.indicators.apo,
        inputs: [data.close],
        options: [params.optInFastPeriod, params.optInSlowPeriod],
        results: ["result"]
      });
    };
  }
};
methods.aroon = {
  requires: ["optInTimePeriod"],
  create: function create(params) {
    verifyParams("aroon", params);
    return function (data) {
      return execute({
        indicator: tulind__WEBPACK_IMPORTED_MODULE_2___default.a.indicators.aroon,
        inputs: [data.high, data.low],
        options: [params.optInTimePeriod],
        results: ["aroonDown", "aroonUp"]
      });
    };
  }
};
methods.aroonosc = {
  requires: ["optInTimePeriod"],
  create: function create(params) {
    verifyParams("aroonosc", params);
    return function (data) {
      return execute({
        indicator: tulind__WEBPACK_IMPORTED_MODULE_2___default.a.indicators.aroonosc,
        inputs: [data.high, data.low],
        options: [params.optInTimePeriod],
        results: ["result"]
      });
    };
  }
};
methods.atr = {
  requires: ["optInTimePeriod"],
  create: function create(params) {
    verifyParams("atr", params);
    return function (data) {
      return execute({
        indicator: tulind__WEBPACK_IMPORTED_MODULE_2___default.a.indicators.atr,
        inputs: [data.high, data.low, data.close],
        options: [params.optInTimePeriod],
        results: ["result"]
      });
    };
  }
};
methods.avgprice = {
  requires: [],
  create: function create(params) {
    verifyParams("avgprice", params);
    return function (data) {
      return execute({
        indicator: tulind__WEBPACK_IMPORTED_MODULE_2___default.a.indicators.avgprice,
        inputs: [data.open, data.high, data.low, data.close],
        options: [],
        results: ["result"]
      });
    };
  }
};
methods.bbands = {
  requires: ["optInTimePeriod", "optInNbStdDevs"],
  create: function create(params) {
    verifyParams("bbands", params);
    return function (data) {
      return execute({
        indicator: tulind__WEBPACK_IMPORTED_MODULE_2___default.a.indicators.bbands,
        inputs: [data.close],
        options: [params.optInTimePeriod, params.optInNbStdDevs],
        results: ["bbandsLower", "bbandsMiddle", "bbandsUpper"]
      });
    };
  }
};
methods.bop = {
  requires: [],
  create: function create(params) {
    verifyParams("bop", params);
    return function (data) {
      return execute({
        indicator: tulind__WEBPACK_IMPORTED_MODULE_2___default.a.indicators.bop,
        inputs: [data.open, data.high, data.low, data.close],
        options: [],
        results: ["result"]
      });
    };
  }
};
methods.cci = {
  requires: ["optInTimePeriod"],
  create: function create(params) {
    verifyParams("cci", params);
    return function (data) {
      return execute({
        indicator: tulind__WEBPACK_IMPORTED_MODULE_2___default.a.indicators.cci,
        inputs: [data.high, data.low, data.close],
        options: [params.optInTimePeriod],
        results: ["result"]
      });
    };
  }
};
methods.cmo = {
  requires: ["optInTimePeriod"],
  create: function create(params) {
    verifyParams("cmo", params);
    return function (data) {
      return execute({
        indicator: tulind__WEBPACK_IMPORTED_MODULE_2___default.a.indicators.cmo,
        inputs: [data.close],
        options: [params.optInTimePeriod],
        results: ["result"]
      });
    };
  }
};
methods.cvi = {
  requires: ["optInTimePeriod"],
  create: function create(params) {
    verifyParams("cvi", params);
    return function (data) {
      return execute({
        indicator: tulind__WEBPACK_IMPORTED_MODULE_2___default.a.indicators.cvi,
        inputs: [data.high, data.low],
        options: [params.optInTimePeriod],
        results: ["result"]
      });
    };
  }
};
methods.dema = {
  requires: ["optInTimePeriod"],
  create: function create(params) {
    verifyParams("dema", params);
    return function (data) {
      return execute({
        indicator: tulind__WEBPACK_IMPORTED_MODULE_2___default.a.indicators.dema,
        inputs: [data.close],
        options: [params.optInTimePeriod],
        results: ["result"]
      });
    };
  }
};
methods.di = {
  requires: ["optInTimePeriod"],
  create: function create(params) {
    verifyParams("di", params);
    return function (data) {
      return execute({
        indicator: tulind__WEBPACK_IMPORTED_MODULE_2___default.a.indicators.di,
        inputs: [data.high, data.low, data.close],
        options: [params.optInTimePeriod],
        results: ["diPlus", "diMinus"]
      });
    };
  }
};
methods.dm = {
  requires: ["optInTimePeriod"],
  create: function create(params) {
    verifyParams("dm", params);
    return function (data) {
      return execute({
        indicator: tulind__WEBPACK_IMPORTED_MODULE_2___default.a.indicators.dm,
        inputs: [data.high, data.low],
        options: [params.optInTimePeriod],
        results: ["dmPlus", "dmLow"]
      });
    };
  }
};
methods.dpo = {
  requires: ["optInTimePeriod"],
  create: function create(params) {
    verifyParams("dpo", params);
    return function (data) {
      return execute({
        indicator: tulind__WEBPACK_IMPORTED_MODULE_2___default.a.indicators.dpo,
        inputs: [data.close],
        options: [params.optInTimePeriod],
        results: ["result"]
      });
    };
  }
};
methods.dx = {
  requires: ["optInTimePeriod"],
  create: function create(params) {
    verifyParams("dx", params);
    return function (data) {
      return execute({
        indicator: tulind__WEBPACK_IMPORTED_MODULE_2___default.a.indicators.dx,
        inputs: [data.high, data.low, data.close],
        options: [params.optInTimePeriod],
        results: ["result"]
      });
    };
  }
};
methods.ema = {
  requires: ["optInTimePeriod"],
  create: function create(params) {
    verifyParams("ema", params);
    return function (data) {
      return execute({
        indicator: tulind__WEBPACK_IMPORTED_MODULE_2___default.a.indicators.ema,
        inputs: [data.close],
        options: [params.optInTimePeriod],
        results: ["result"]
      });
    };
  }
};
methods.emv = {
  requires: [],
  create: function create(params) {
    verifyParams("emv", params);
    return function (data) {
      return execute({
        indicator: tulind__WEBPACK_IMPORTED_MODULE_2___default.a.indicators.emv,
        inputs: [data.high, data.low, data.volume],
        options: [params.optInTimePeriod],
        results: []
      });
    };
  }
};
methods.fisher = {
  requires: ["optInTimePeriod"],
  create: function create(params) {
    verifyParams("fisher", params);
    return function (data) {
      return execute({
        indicator: tulind__WEBPACK_IMPORTED_MODULE_2___default.a.indicators.fisher,
        inputs: [data.high, data.low],
        options: [params.optInTimePeriod],
        results: ["fisher", "fisherPeriod"]
      });
    };
  }
};
methods.fosc = {
  requires: ["optInTimePeriod"],
  create: function create(params) {
    verifyParams("fosc", params);
    return function (data) {
      return execute({
        indicator: tulind__WEBPACK_IMPORTED_MODULE_2___default.a.indicators.fosc,
        inputs: [data.close],
        options: [params.optInTimePeriod],
        results: ["result"]
      });
    };
  }
};
methods.hma = {
  requires: ["optInTimePeriod"],
  create: function create(params) {
    verifyParams("hma", params);
    return function (data) {
      return execute({
        indicator: tulind__WEBPACK_IMPORTED_MODULE_2___default.a.indicators.hma,
        inputs: [data.close],
        options: [params.optInTimePeriod],
        results: ["result"]
      });
    };
  }
};
methods.kama = {
  requires: ["optInTimePeriod"],
  create: function create(params) {
    verifyParams("kama", params);
    return function (data) {
      return execute({
        indicator: tulind__WEBPACK_IMPORTED_MODULE_2___default.a.indicators.kama,
        inputs: [data.close],
        options: [params.optInTimePeriod],
        results: ["result"]
      });
    };
  }
};
methods.kvo = {
  requires: ["optInFastPeriod", "optInSlowPeriod"],
  create: function create(params) {
    verifyParams("kvo", params);
    return function (data) {
      return execute({
        indicator: tulind__WEBPACK_IMPORTED_MODULE_2___default.a.indicators.kvo,
        inputs: [data.high, data.low, data.close, data.volume],
        options: [params.optInFastPeriod, params.optInSlowPeriod],
        results: ["result"]
      });
    };
  }
};
methods.linreg = {
  requires: ["optInTimePeriod"],
  create: function create(params) {
    verifyParams("linreg", params);
    return function (data) {
      return execute({
        indicator: tulind__WEBPACK_IMPORTED_MODULE_2___default.a.indicators.linreg,
        inputs: [data.close],
        options: [params.optInTimePeriod],
        results: ["result"]
      });
    };
  }
};
methods.linregintercept = {
  requires: ["optInTimePeriod"],
  create: function create(params) {
    verifyParams("linregintercept", params);
    return function (data) {
      return execute({
        indicator: tulind__WEBPACK_IMPORTED_MODULE_2___default.a.indicators.linregintercept,
        inputs: [data.close],
        options: [params.optInTimePeriod],
        results: ["result"]
      });
    };
  }
};
methods.linregslope = {
  requires: ["optInTimePeriod"],
  create: function create(params) {
    verifyParams("linregslope", params);
    return function (data) {
      return execute({
        indicator: tulind__WEBPACK_IMPORTED_MODULE_2___default.a.indicators.linregslope,
        inputs: [data.close],
        options: [params.optInTimePeriod],
        results: ["result"]
      });
    };
  }
};
methods.macd = {
  requires: ["optInFastPeriod", "optInSlowPeriod", "optInSignalPeriod"],
  create: function create(params) {
    verifyParams("macd", params);
    return function (data) {
      return execute({
        indicator: tulind__WEBPACK_IMPORTED_MODULE_2___default.a.indicators.macd,
        inputs: [data.close],
        options: [params.optInFastPeriod, params.optInSlowPeriod, params.optInSignalPeriod],
        results: ["macd", "macdSignal", "macdHistogram"]
      });
    };
  }
};
methods.marketfi = {
  requires: [],
  create: function create(params) {
    verifyParams("marketfi", params);
    return function (data) {
      return execute({
        indicator: tulind__WEBPACK_IMPORTED_MODULE_2___default.a.indicators.marketfi,
        inputs: [data.high, data.low, data.volume],
        options: [],
        results: ["result"]
      });
    };
  }
};
methods.mass = {
  requires: ["optInTimePeriod"],
  create: function create(params) {
    verifyParams("mass", params);
    return function (data) {
      return execute({
        indicator: tulind__WEBPACK_IMPORTED_MODULE_2___default.a.indicators.mass,
        inputs: [data.high, data.low],
        options: [params.optInTimePeriod],
        results: ["result"]
      });
    };
  }
};
methods.medprice = {
  requires: [],
  create: function create(params) {
    verifyParams("medprice", params);
    return function (data) {
      return execute({
        indicator: tulind__WEBPACK_IMPORTED_MODULE_2___default.a.indicators.medprice,
        inputs: [data.high, data.low],
        options: [],
        results: ["result"]
      });
    };
  }
};
methods.mfi = {
  requires: ["optInTimePeriod"],
  create: function create(params) {
    verifyParams("mfi", params);
    return function (data) {
      return execute({
        indicator: tulind__WEBPACK_IMPORTED_MODULE_2___default.a.indicators.mfi,
        inputs: [data.high, data.low, data.close, data.volume],
        options: [params.optInTimePeriod],
        results: ["result"]
      });
    };
  }
};
methods.msw = {
  requires: ["optInTimePeriod"],
  create: function create(params) {
    verifyParams("msw", params);
    return function (data) {
      return execute({
        indicator: tulind__WEBPACK_IMPORTED_MODULE_2___default.a.indicators.msw,
        inputs: [data.close],
        options: [params.optInTimePeriod],
        results: ["mswSine", "mswLead"]
      });
    };
  }
};
methods.natr = {
  requires: ["optInTimePeriod"],
  create: function create(params) {
    verifyParams("natr", params);
    return function (data) {
      return execute({
        indicator: tulind__WEBPACK_IMPORTED_MODULE_2___default.a.indicators.natr,
        inputs: [data.high, data.low, data.close],
        options: [params.optInTimePeriod],
        results: ["result"]
      });
    };
  }
};
methods.nvi = {
  requires: [],
  create: function create(params) {
    verifyParams("nvi", params);
    return function (data) {
      return execute({
        indicator: tulind__WEBPACK_IMPORTED_MODULE_2___default.a.indicators.nvi,
        inputs: [data.close, data.volume],
        options: [],
        results: ["result"]
      });
    };
  }
};
methods.obv = {
  requires: [],
  create: function create(params) {
    verifyParams("obv", params);
    return function (data) {
      return execute({
        indicator: tulind__WEBPACK_IMPORTED_MODULE_2___default.a.indicators.obv,
        inputs: [data.close, data.volume],
        options: [],
        results: ["result"]
      });
    };
  }
};
methods.ppo = {
  requires: ["optInFastPeriod", "optInSlowPeriod"],
  create: function create(params) {
    verifyParams("ppo", params);
    return function (data) {
      return execute({
        indicator: tulind__WEBPACK_IMPORTED_MODULE_2___default.a.indicators.ppo,
        inputs: [data.close],
        options: [params.optInFastPeriod, params.optInSlowPeriod],
        results: ["result"]
      });
    };
  }
};
methods.psar = {
  requires: ["optInAcceleration", "optInMaximum"],
  create: function create(params) {
    verifyParams("psar", params);
    return function (data) {
      return execute({
        indicator: tulind__WEBPACK_IMPORTED_MODULE_2___default.a.indicators.psar,
        inputs: [data.high, data.low],
        options: [params.optInAcceleration, params.optInMaximum],
        results: ["result"]
      });
    };
  }
};
methods.pvi = {
  requires: [],
  create: function create(params) {
    verifyParams("pvi", params);
    return function (data) {
      return execute({
        indicator: tulind__WEBPACK_IMPORTED_MODULE_2___default.a.indicators.pvi,
        inputs: [data.close, data.volume],
        options: [],
        results: ["result"]
      });
    };
  }
};
methods.qstick = {
  requires: ["optInTimePeriod"],
  create: function create(params) {
    verifyParams("qstick", params);
    return function (data) {
      return execute({
        indicator: tulind__WEBPACK_IMPORTED_MODULE_2___default.a.indicators.qstick,
        inputs: [data.open, data.close],
        options: [params.optInTimePeriod],
        results: ["result"]
      });
    };
  }
};
methods.roc = {
  requires: ["optInTimePeriod"],
  create: function create(params) {
    verifyParams("roc", params);
    return function (data) {
      return execute({
        indicator: tulind__WEBPACK_IMPORTED_MODULE_2___default.a.indicators.roc,
        inputs: [data.close],
        options: [params.optInTimePeriod],
        results: ["result"]
      });
    };
  }
};
methods.rocr = {
  requires: ["optInTimePeriod"],
  create: function create(params) {
    verifyParams("rocr", params);
    return function (data) {
      return execute({
        indicator: tulind__WEBPACK_IMPORTED_MODULE_2___default.a.indicators.rocr,
        inputs: [data.close],
        options: [params.optInTimePeriod],
        results: ["result"]
      });
    };
  }
};
methods.rsi = {
  requires: ["optInTimePeriod"],
  create: function create(params) {
    verifyParams("rsi", params);
    return function (data) {
      return execute({
        indicator: tulind__WEBPACK_IMPORTED_MODULE_2___default.a.indicators.rsi,
        inputs: [data.close],
        options: [params.optInTimePeriod],
        results: ["result"]
      });
    };
  }
};
methods.sma = {
  requires: ["optInTimePeriod"],
  create: function create(params) {
    verifyParams("sma", params);
    return function (data) {
      return execute({
        indicator: tulind__WEBPACK_IMPORTED_MODULE_2___default.a.indicators.sma,
        inputs: [data.close],
        options: [params.optInTimePeriod],
        results: ["result"]
      });
    };
  }
};
methods.stddev = {
  requires: ["optInTimePeriod"],
  create: function create(params) {
    verifyParams("stddev", params);
    return function (data) {
      return execute({
        indicator: tulind__WEBPACK_IMPORTED_MODULE_2___default.a.indicators.stddev,
        inputs: [data.close],
        options: [params.optInTimePeriod],
        results: ["result"]
      });
    };
  }
};
methods.stoch = {
  requires: ["optInFastKPeriod", "optInSlowKPeriod", "optInSlowDPeriod"],
  create: function create(params) {
    verifyParams("stoch", params);
    return function (data) {
      return execute({
        indicator: tulind__WEBPACK_IMPORTED_MODULE_2___default.a.indicators.stoch,
        inputs: [data.high, data.low, data.close],
        options: [params.optInFastKPeriod, params.optInSlowKPeriod, params.optInSlowDPeriod],
        results: ["stochK", "stochD"]
      });
    };
  }
};
methods.sum = {
  requires: ["optInTimePeriod"],
  create: function create(params) {
    verifyParams("sum", params);
    return function (data) {
      return execute({
        indicator: tulind__WEBPACK_IMPORTED_MODULE_2___default.a.indicators.sum,
        inputs: [data.close],
        options: [params.optInTimePeriod],
        results: ["result"]
      });
    };
  }
};
methods.tema = {
  requires: ["optInTimePeriod"],
  create: function create(params) {
    verifyParams("tema", params);
    return function (data) {
      return execute({
        indicator: tulind__WEBPACK_IMPORTED_MODULE_2___default.a.indicators.tema,
        inputs: [data.close],
        options: [params.optInTimePeriod],
        results: ["result"]
      });
    };
  }
};
methods.tr = {
  requires: [],
  create: function create(params) {
    verifyParams("tr", params);
    return function (data) {
      return execute({
        indicator: tulind__WEBPACK_IMPORTED_MODULE_2___default.a.indicators.tr,
        inputs: [data.high, data.low, data.close],
        options: [],
        results: ["result"]
      });
    };
  }
};
methods.trima = {
  requires: ["optInTimePeriod"],
  create: function create(params) {
    verifyParams("trima", params);
    return function (data) {
      return execute({
        indicator: tulind__WEBPACK_IMPORTED_MODULE_2___default.a.indicators.trima,
        inputs: [data.close],
        options: [params.optInTimePeriod],
        results: ["result"]
      });
    };
  }
};
methods.trix = {
  requires: ["optInTimePeriod"],
  create: function create(params) {
    verifyParams("trix", params);
    return function (data) {
      return execute({
        indicator: tulind__WEBPACK_IMPORTED_MODULE_2___default.a.indicators.trix,
        inputs: [data.close],
        options: [params.optInTimePeriod],
        results: ["result"]
      });
    };
  }
};
methods.tsf = {
  requires: ["optInTimePeriod"],
  create: function create(params) {
    verifyParams("tsf", params);
    return function (data) {
      return execute({
        indicator: tulind__WEBPACK_IMPORTED_MODULE_2___default.a.indicators.tsf,
        inputs: [data.close],
        options: [params.optInTimePeriod],
        results: ["result"]
      });
    };
  }
};
methods.typprice = {
  requires: [],
  create: function create(params) {
    verifyParams("typprice", params);
    return function (data) {
      return execute({
        indicator: tulind__WEBPACK_IMPORTED_MODULE_2___default.a.indicators.typprice,
        inputs: [data.high, data.low, data.close],
        options: [],
        results: ["result"]
      });
    };
  }
};
methods.ultosc = {
  requires: ["optInTimePeriod1", "optInTimePeriod2", "optInTimePeriod3"],
  create: function create(params) {
    verifyParams("ultosc", params);
    return function (data) {
      return execute({
        indicator: tulind__WEBPACK_IMPORTED_MODULE_2___default.a.indicators.ultosc,
        inputs: [data.high, data.low, data.close],
        options: [params.optInTimePeriod1, params.optInTimePeriod2, params.optInTimePeriod3],
        results: ["result"]
      });
    };
  }
};
methods.vhf = {
  requires: ["optInTimePeriod"],
  create: function create(params) {
    verifyParams("vhf", params);
    return function (data) {
      return execute({
        indicator: tulind__WEBPACK_IMPORTED_MODULE_2___default.a.indicators.vhf,
        inputs: [data.close],
        options: [params.optInTimePeriod],
        results: ["result"]
      });
    };
  }
};
methods.vidya = {
  requires: ["optInFastPeriod", "optInSlowPeriod", "optInAlpha"],
  create: function create(params) {
    verifyParams("vidya", params);
    return function (data) {
      return execute({
        indicator: tulind__WEBPACK_IMPORTED_MODULE_2___default.a.indicators.vidya,
        inputs: [data.close],
        options: [params.optInFastPeriod, params.optInSlowPeriod, params.optInAlpha],
        results: ["result"]
      });
    };
  }
};
methods.volatility = {
  requires: ["optInTimePeriod"],
  create: function create(params) {
    verifyParams("volatility", params);
    return function (data) {
      return execute({
        indicator: tulind__WEBPACK_IMPORTED_MODULE_2___default.a.indicators.volatility,
        inputs: [data.close],
        options: [params.optInTimePeriod],
        results: ["result"]
      });
    };
  }
};
methods.vosc = {
  requires: ["optInFastPeriod", "optInSlowPeriod"],
  create: function create(params) {
    verifyParams("vosc", params);
    return function (data) {
      return execute({
        indicator: tulind__WEBPACK_IMPORTED_MODULE_2___default.a.indicators.vosc,
        inputs: [data.volume],
        options: [params.optInFastPeriod, params.optInSlowPeriod],
        results: ["result"]
      });
    };
  }
};
methods.vwma = {
  requires: ["optInTimePeriod"],
  create: function create(params) {
    verifyParams("vwma", params);
    return function (data) {
      return execute({
        indicator: tulind__WEBPACK_IMPORTED_MODULE_2___default.a.indicators.vwma,
        inputs: [data.close, data.volume],
        options: [params.optInTimePeriod],
        results: ["result"]
      });
    };
  }
};
methods.wad = {
  requires: [],
  create: function create(params) {
    verifyParams("wad", params);
    return function (data) {
      return execute({
        indicator: tulind__WEBPACK_IMPORTED_MODULE_2___default.a.indicators.wad,
        inputs: [data.high, data.low, data.close],
        options: [],
        results: ["result"]
      });
    };
  }
};
methods.wcprice = {
  requires: [],
  create: function create(params) {
    verifyParams("wcprice", params);
    return function (data) {
      return execute({
        indicator: tulind__WEBPACK_IMPORTED_MODULE_2___default.a.indicators.wcprice,
        inputs: [data.high, data.low, data.close],
        options: [],
        results: ["result"]
      });
    };
  }
};
methods.wilders = {
  requires: ["optInTimePeriod"],
  create: function create(params) {
    verifyParams("wilders", params);
    return function (data) {
      return execute({
        indicator: tulind__WEBPACK_IMPORTED_MODULE_2___default.a.indicators.wilders,
        inputs: [data.close],
        options: [params.optInTimePeriod],
        results: ["result"]
      });
    };
  }
};
methods.willr = {
  requires: ["optInTimePeriod"],
  create: function create(params) {
    verifyParams("willr", params);
    return function (data) {
      return execute({
        indicator: tulind__WEBPACK_IMPORTED_MODULE_2___default.a.indicators.willr,
        inputs: [data.high, data.low, data.close],
        options: [params.optInTimePeriod],
        results: ["result"]
      });
    };
  }
};
methods.wma = {
  requires: ["optInTimePeriod"],
  create: function create(params) {
    verifyParams("wma", params);
    return function (data) {
      return execute({
        indicator: tulind__WEBPACK_IMPORTED_MODULE_2___default.a.indicators.wma,
        inputs: [data.close],
        options: [params.optInTimePeriod],
        results: ["result"]
      });
    };
  }
};
methods.zlema = {
  requires: ["optInTimePeriod"],
  create: function create(params) {
    verifyParams("zlema", params);
    return function (data) {
      return execute({
        indicator: tulind__WEBPACK_IMPORTED_MODULE_2___default.a.indicators.zlema,
        inputs: [data.close],
        options: [params.optInTimePeriod],
        results: ["result"]
      });
    };
  }
};
/* harmony default export */ __webpack_exports__["default"] = (methods);

/***/ }),

/***/ "./src/lib/tulip/tulipIndicators.js":
/*!******************************************!*\
  !*** ./src/lib/tulip/tulipIndicators.js ***!
  \******************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/regenerator */ "@babel/runtime/regenerator");
/* harmony import */ var _babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _babel_runtime_helpers_asyncToGenerator__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @babel/runtime/helpers/asyncToGenerator */ "@babel/runtime/helpers/asyncToGenerator");
/* harmony import */ var _babel_runtime_helpers_asyncToGenerator__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_babel_runtime_helpers_asyncToGenerator__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @babel/runtime/helpers/classCallCheck */ "@babel/runtime/helpers/classCallCheck");
/* harmony import */ var _babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @babel/runtime/helpers/createClass */ "@babel/runtime/helpers/createClass");
/* harmony import */ var _babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _babel_runtime_helpers_possibleConstructorReturn__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @babel/runtime/helpers/possibleConstructorReturn */ "@babel/runtime/helpers/possibleConstructorReturn");
/* harmony import */ var _babel_runtime_helpers_possibleConstructorReturn__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_babel_runtime_helpers_possibleConstructorReturn__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var _babel_runtime_helpers_getPrototypeOf__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @babel/runtime/helpers/getPrototypeOf */ "@babel/runtime/helpers/getPrototypeOf");
/* harmony import */ var _babel_runtime_helpers_getPrototypeOf__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(_babel_runtime_helpers_getPrototypeOf__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var _babel_runtime_helpers_inherits__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @babel/runtime/helpers/inherits */ "@babel/runtime/helpers/inherits");
/* harmony import */ var _babel_runtime_helpers_inherits__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(_babel_runtime_helpers_inherits__WEBPACK_IMPORTED_MODULE_6__);
/* harmony import */ var _adviser_baseIndicator__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../../adviser/baseIndicator */ "./src/adviser/baseIndicator.js");
/* harmony import */ var _create__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./create */ "./src/lib/tulip/create.js");










var Tulip =
/*#__PURE__*/
function (_BaseIndicator) {
  _babel_runtime_helpers_inherits__WEBPACK_IMPORTED_MODULE_6___default()(Tulip, _BaseIndicator);

  function Tulip(state) {
    var _this;

    _babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_2___default()(this, Tulip);

    _this = _babel_runtime_helpers_possibleConstructorReturn__WEBPACK_IMPORTED_MODULE_4___default()(this, _babel_runtime_helpers_getPrototypeOf__WEBPACK_IMPORTED_MODULE_5___default()(Tulip).call(this, state));
    _this.calculate = _create__WEBPACK_IMPORTED_MODULE_8__["default"][state.indicatorName].create(state.options);
    return _this;
  }

  _babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_3___default()(Tulip, [{
    key: "calc",
    value: function () {
      var _calc = _babel_runtime_helpers_asyncToGenerator__WEBPACK_IMPORTED_MODULE_1___default()(
      /*#__PURE__*/
      _babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_0___default.a.mark(function _callee() {
        var _this2 = this;

        var result, resultKeys;
        return _babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_0___default.a.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.prev = 0;
                this.log("CALC");
                _context.next = 4;
                return this.calculate(this.candlesProps);

              case 4:
                result = _context.sent;
                this.log("result", result);
                resultKeys = Object.keys(result);

                if (resultKeys.length > 0) {
                  resultKeys.forEach(function (key) {
                    _this2[key] = result[key];
                  });
                } else {
                  this.result = result;
                }

                this.log("this.result", this.result);
                _context.next = 15;
                break;

              case 11:
                _context.prev = 11;
                _context.t0 = _context["catch"](0);

                this._context.log.error(_context.t0);

                throw _context.t0;

              case 15:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this, [[0, 11]]);
      }));

      return function calc() {
        return _calc.apply(this, arguments);
      };
    }()
  }]);

  return Tulip;
}(_adviser_baseIndicator__WEBPACK_IMPORTED_MODULE_7__["default"]);

/* harmony default export */ __webpack_exports__["default"] = (Tulip);

/***/ }),

/***/ "./src/strategies sync recursive ^\\.\\/.*$":
/*!**************************************!*\
  !*** ./src/strategies sync ^\.\/.*$ ***!
  \**************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var map = {
	"./STR_ROBOT_1": "./src/strategies/STR_ROBOT_1.js",
	"./STR_ROBOT_1.js": "./src/strategies/STR_ROBOT_1.js",
	"./STR_ROBOT_2": "./src/strategies/STR_ROBOT_2.js",
	"./STR_ROBOT_2.js": "./src/strategies/STR_ROBOT_2.js"
};


function webpackContext(req) {
	var id = webpackContextResolve(req);
	return __webpack_require__(id);
}
function webpackContextResolve(req) {
	var id = map[req];
	if(!(id + 1)) { // check for number or string
		var e = new Error("Cannot find module '" + req + "'");
		e.code = 'MODULE_NOT_FOUND';
		throw e;
	}
	return id;
}
webpackContext.keys = function webpackContextKeys() {
	return Object.keys(map);
};
webpackContext.resolve = webpackContextResolve;
module.exports = webpackContext;
webpackContext.id = "./src/strategies sync recursive ^\\.\\/.*$";

/***/ }),

/***/ "./src/strategies/STR_ROBOT_1.js":
/*!***************************************!*\
  !*** ./src/strategies/STR_ROBOT_1.js ***!
  \***************************************/
/*! no static exports found */
/***/ (function(module, exports) {

var StrRobot1 = {
  userDefinedFunc: function userDefinedFunc() {
    this.log(this.userDefinedVar);
  },
  init: function init() {
    this.log("init");
    this.userDefinedVar = "test";
    this.myInitialVar = {
      some: "value"
    };
    this.addIndicator("MyEMA", "EMA", {
      weight: 1
    });
  },
  check: function check() {
    this.log("check");
    this.log(this.candle);
    this.log(this.userDefinedVar);
    this.log(this.indicators.MyEMA.result);
    this.userDefinedFunc();
    var newSignal = {
      alertTime: new Date().toISOString,
      action: "long",
      qty: 1,
      orderType: "stop",
      price: 1111,
      priceSource: "close",
      positionId: 11,
      params: {
        slippageStep: 11,
        volume: 1
      }
    };
    this.advice(newSignal);
  }
};
module.exports = StrRobot1;

/***/ }),

/***/ "./src/strategies/STR_ROBOT_2.js":
/*!***************************************!*\
  !*** ./src/strategies/STR_ROBOT_2.js ***!
  \***************************************/
/*! no static exports found */
/***/ (function(module, exports) {

var StrRobot2 = {
  init: function init() {
    this.log("init");
    this.userDefinedVar = "test";
    this.myInitialVar = {
      some: "value"
    };
    this.addTulipIndicator("myEMA", "ema", {
      optInTimePeriod: 10
    });
  },
  check: function check() {
    this.log("check");
    this.log(this.candle);
    this.log(this.indicators.myEMA.result);
    var newSignal = {
      alertTime: new Date().toISOString,
      action: "long",
      qty: 2,
      orderType: "stop",
      price: this.indicators.myEMA.result,
      priceSource: "close",
      positionId: 22,
      params: {
        slippageStep: 22,
        volume: 2
      }
    };
    this.advice(newSignal);
  }
};
module.exports = StrRobot2;

/***/ }),

/***/ "./src/tableStorage/index.js":
/*!***********************************!*\
  !*** ./src/tableStorage/index.js ***!
  \***********************************/
/*! exports provided: saveAdviserState, savePendingCandles, updateAdviserState, deletePendingCandles, getAdviserByKey, getAdvisersBySlug, getCachedCandlesByKey, getPendingCandlesByAdviserId */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "saveAdviserState", function() { return saveAdviserState; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "savePendingCandles", function() { return savePendingCandles; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "updateAdviserState", function() { return updateAdviserState; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "deletePendingCandles", function() { return deletePendingCandles; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getAdviserByKey", function() { return getAdviserByKey; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getAdvisersBySlug", function() { return getAdvisersBySlug; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getCachedCandlesByKey", function() { return getCachedCandlesByKey; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getPendingCandlesByAdviserId", function() { return getPendingCandlesByAdviserId; });
/* harmony import */ var _babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/regenerator */ "@babel/runtime/regenerator");
/* harmony import */ var _babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _babel_runtime_helpers_objectSpread__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @babel/runtime/helpers/objectSpread */ "@babel/runtime/helpers/objectSpread");
/* harmony import */ var _babel_runtime_helpers_objectSpread__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_babel_runtime_helpers_objectSpread__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _babel_runtime_helpers_asyncToGenerator__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @babel/runtime/helpers/asyncToGenerator */ "@babel/runtime/helpers/asyncToGenerator");
/* harmony import */ var _babel_runtime_helpers_asyncToGenerator__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_babel_runtime_helpers_asyncToGenerator__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var azure_storage__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! azure-storage */ "azure-storage");
/* harmony import */ var azure_storage__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(azure_storage__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var cpzState__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! cpzState */ "../cpz-shared/config/state/index.js");
/* harmony import */ var cpzStorageTables__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! cpzStorageTables */ "../cpz-shared/config/storageTables/index.js");
/* harmony import */ var _storage__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./storage */ "./src/tableStorage/storage.js");
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./utils */ "./src/tableStorage/utils.js");








var TableQuery = azure_storage__WEBPACK_IMPORTED_MODULE_3___default.a.TableQuery,
    TableUtilities = azure_storage__WEBPACK_IMPORTED_MODULE_3___default.a.TableUtilities;
var entityGenerator = TableUtilities.entityGenerator; // Создать таблицы если не существуют

Object(_storage__WEBPACK_IMPORTED_MODULE_6__["createTableIfNotExists"])(cpzStorageTables__WEBPACK_IMPORTED_MODULE_5__["STORAGE_ADVISERS_TABLE"]);
Object(_storage__WEBPACK_IMPORTED_MODULE_6__["createTableIfNotExists"])(cpzStorageTables__WEBPACK_IMPORTED_MODULE_5__["STORAGE_CANDLESPENDING_TABLE"]);
/**
 * Сохранение состояния советника
 *
 * @param {*} context
 * @param {*} state
 * @returns
 */

function saveAdviserState(_x, _x2) {
  return _saveAdviserState.apply(this, arguments);
}
/**
 * Сохранение свечей ожидающих обработки
 *
 * @param {*} context
 * @param {*} candle
 * @returns
 */


function _saveAdviserState() {
  _saveAdviserState = _babel_runtime_helpers_asyncToGenerator__WEBPACK_IMPORTED_MODULE_2___default()(
  /*#__PURE__*/
  _babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_0___default.a.mark(function _callee(context, state) {
    var entity, entityUpdated;
    return _babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_0___default.a.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.prev = 0;
            entity = _babel_runtime_helpers_objectSpread__WEBPACK_IMPORTED_MODULE_1___default()({
              PartitionKey: entityGenerator.String(Object(_utils__WEBPACK_IMPORTED_MODULE_7__["createSlug"])(state.exchange, state.asset, state.currency, state.timeframe)),
              RowKey: entityGenerator.String(state.taskId)
            }, Object(_utils__WEBPACK_IMPORTED_MODULE_7__["objectToEntity"])(state));
            _context.next = 4;
            return Object(_storage__WEBPACK_IMPORTED_MODULE_6__["insertOrMergeEntity"])(cpzStorageTables__WEBPACK_IMPORTED_MODULE_5__["STORAGE_ADVISERS_TABLE"], entity);

          case 4:
            entityUpdated = _context.sent;
            return _context.abrupt("return", {
              isSuccess: entityUpdated
            });

          case 8:
            _context.prev = 8;
            _context.t0 = _context["catch"](0);
            context.log.error(_context.t0);
            return _context.abrupt("return", {
              isSuccess: false,
              error: _context.t0
            });

          case 12:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, this, [[0, 8]]);
  }));
  return _saveAdviserState.apply(this, arguments);
}

function savePendingCandles(_x3, _x4) {
  return _savePendingCandles.apply(this, arguments);
}
/**
 * Обновление состояния советника
 *
 * @param {*} context
 * @param {*} state
 * @returns
 */


function _savePendingCandles() {
  _savePendingCandles = _babel_runtime_helpers_asyncToGenerator__WEBPACK_IMPORTED_MODULE_2___default()(
  /*#__PURE__*/
  _babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_0___default.a.mark(function _callee2(context, candle) {
    var entity, entityUpdated;
    return _babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_0___default.a.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.prev = 0;
            entity = _babel_runtime_helpers_objectSpread__WEBPACK_IMPORTED_MODULE_1___default()({
              PartitionKey: entityGenerator.String(candle.taskId),
              RowKey: entityGenerator.String(candle.id.toString())
            }, Object(_utils__WEBPACK_IMPORTED_MODULE_7__["objectToEntity"])(candle));
            _context2.next = 4;
            return Object(_storage__WEBPACK_IMPORTED_MODULE_6__["insertOrMergeEntity"])(cpzStorageTables__WEBPACK_IMPORTED_MODULE_5__["STORAGE_CANDLESPENDING_TABLE"], entity);

          case 4:
            entityUpdated = _context2.sent;
            return _context2.abrupt("return", {
              isSuccess: entityUpdated,
              taskId: candle.taskId
            });

          case 8:
            _context2.prev = 8;
            _context2.t0 = _context2["catch"](0);
            context.log.error(_context2.t0);
            return _context2.abrupt("return", {
              isSuccess: false,
              error: _context2.t0
            });

          case 12:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2, this, [[0, 8]]);
  }));
  return _savePendingCandles.apply(this, arguments);
}

function updateAdviserState(_x5, _x6) {
  return _updateAdviserState.apply(this, arguments);
}
/**
 * Удаление свечи ожидающей выполнения
 *
 * @param {*} context
 * @param {*} candle
 * @returns
 */


function _updateAdviserState() {
  _updateAdviserState = _babel_runtime_helpers_asyncToGenerator__WEBPACK_IMPORTED_MODULE_2___default()(
  /*#__PURE__*/
  _babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_0___default.a.mark(function _callee3(context, state) {
    var entity, entityUpdated;
    return _babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_0___default.a.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            _context3.prev = 0;
            entity = _babel_runtime_helpers_objectSpread__WEBPACK_IMPORTED_MODULE_1___default()({}, Object(_utils__WEBPACK_IMPORTED_MODULE_7__["objectToEntity"])(state));
            _context3.next = 4;
            return Object(_storage__WEBPACK_IMPORTED_MODULE_6__["mergeEntity"])(cpzStorageTables__WEBPACK_IMPORTED_MODULE_5__["STORAGE_ADVISERS_TABLE"], entity);

          case 4:
            entityUpdated = _context3.sent;
            return _context3.abrupt("return", {
              isSuccess: entityUpdated
            });

          case 8:
            _context3.prev = 8;
            _context3.t0 = _context3["catch"](0);
            context.log.error(_context3.t0);
            return _context3.abrupt("return", {
              isSuccess: false,
              error: _context3.t0
            });

          case 12:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3, this, [[0, 8]]);
  }));
  return _updateAdviserState.apply(this, arguments);
}

function deletePendingCandles(_x7, _x8) {
  return _deletePendingCandles.apply(this, arguments);
}
/**
 * Поиск советника по уникальному ключу
 *
 * @param {*} context
 * @param {object} keys
 * @returns
 */


function _deletePendingCandles() {
  _deletePendingCandles = _babel_runtime_helpers_asyncToGenerator__WEBPACK_IMPORTED_MODULE_2___default()(
  /*#__PURE__*/
  _babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_0___default.a.mark(function _callee4(context, candle) {
    var entity, entityDeleted;
    return _babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_0___default.a.wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            _context4.prev = 0;
            entity = _babel_runtime_helpers_objectSpread__WEBPACK_IMPORTED_MODULE_1___default()({
              PartitionKey: entityGenerator.String(candle.taskId),
              RowKey: entityGenerator.String(candle.id.toString())
            }, Object(_utils__WEBPACK_IMPORTED_MODULE_7__["objectToEntity"])(candle));
            _context4.next = 4;
            return Object(_storage__WEBPACK_IMPORTED_MODULE_6__["deleteEntity"])(cpzStorageTables__WEBPACK_IMPORTED_MODULE_5__["STORAGE_CANDLESPENDING_TABLE"], entity);

          case 4:
            entityDeleted = _context4.sent;
            return _context4.abrupt("return", {
              isSuccess: entityDeleted
            });

          case 8:
            _context4.prev = 8;
            _context4.t0 = _context4["catch"](0);
            context.log.error(_context4.t0);
            return _context4.abrupt("return", {
              isSuccess: false,
              error: _context4.t0
            });

          case 12:
          case "end":
            return _context4.stop();
        }
      }
    }, _callee4, this, [[0, 8]]);
  }));
  return _deletePendingCandles.apply(this, arguments);
}

function getAdviserByKey(_x9, _x10) {
  return _getAdviserByKey.apply(this, arguments);
}
/**
 * Поиск запущенных или занятых советников по бирже+инструменту+таймфрейму
 *
 * @param {*} context
 * @param {string} slug
 * @returns
 */


function _getAdviserByKey() {
  _getAdviserByKey = _babel_runtime_helpers_asyncToGenerator__WEBPACK_IMPORTED_MODULE_2___default()(
  /*#__PURE__*/
  _babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_0___default.a.mark(function _callee5(context, keys) {
    var rowKeyFilter, partitionKeyFilter, query, result, entities;
    return _babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_0___default.a.wrap(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            _context5.prev = 0;
            rowKeyFilter = TableQuery.stringFilter("RowKey", TableUtilities.QueryComparisons.EQUAL, keys.rowKey);
            partitionKeyFilter = TableQuery.stringFilter("PartitionKey", TableUtilities.QueryComparisons.EQUAL, keys.partitionKey);
            query = new TableQuery().where(TableQuery.combineFilters(rowKeyFilter, TableUtilities.TableOperators.AND, partitionKeyFilter));
            _context5.next = 6;
            return Object(_storage__WEBPACK_IMPORTED_MODULE_6__["queryEntities"])(cpzStorageTables__WEBPACK_IMPORTED_MODULE_5__["STORAGE_ADVISERS_TABLE"], query);

          case 6:
            result = _context5.sent;
            entities = [];

            if (result) {
              result.entries.forEach(function (element) {
                entities.push(Object(_utils__WEBPACK_IMPORTED_MODULE_7__["entityToObject"])(element));
              });
            }

            return _context5.abrupt("return", {
              isSuccess: true,
              data: entities[0]
            });

          case 12:
            _context5.prev = 12;
            _context5.t0 = _context5["catch"](0);
            context.log.error(_context5.t0, keys);
            return _context5.abrupt("return", {
              isSuccess: false,
              error: _context5.t0
            });

          case 16:
          case "end":
            return _context5.stop();
        }
      }
    }, _callee5, this, [[0, 12]]);
  }));
  return _getAdviserByKey.apply(this, arguments);
}

function getAdvisersBySlug(_x11, _x12) {
  return _getAdvisersBySlug.apply(this, arguments);
}
/**
 * Отбор закешированныз свечей по ключу
 *
 * @param {*} context
 * @param {string} key
 * @returns
 */


function _getAdvisersBySlug() {
  _getAdvisersBySlug = _babel_runtime_helpers_asyncToGenerator__WEBPACK_IMPORTED_MODULE_2___default()(
  /*#__PURE__*/
  _babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_0___default.a.mark(function _callee6(context, slug) {
    var partitionKeyFilter, startedStatusFilter, budyStatusFilter, statusFilter, query, result, entities;
    return _babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_0___default.a.wrap(function _callee6$(_context6) {
      while (1) {
        switch (_context6.prev = _context6.next) {
          case 0:
            _context6.prev = 0;
            partitionKeyFilter = TableQuery.stringFilter("PartitionKey", TableUtilities.QueryComparisons.EQUAL, slug);
            startedStatusFilter = TableQuery.stringFilter("status", TableUtilities.QueryComparisons.EQUAL, cpzState__WEBPACK_IMPORTED_MODULE_4__["STATUS_STARTED"]);
            budyStatusFilter = TableQuery.stringFilter("status", TableUtilities.QueryComparisons.EQUAL, cpzState__WEBPACK_IMPORTED_MODULE_4__["STATUS_BUSY"]);
            statusFilter = TableQuery.combineFilters(startedStatusFilter, TableUtilities.TableOperators.OR, budyStatusFilter);
            query = new TableQuery().where(TableQuery.combineFilters(partitionKeyFilter, TableUtilities.TableOperators.AND, statusFilter));
            _context6.next = 8;
            return Object(_storage__WEBPACK_IMPORTED_MODULE_6__["queryEntities"])(cpzStorageTables__WEBPACK_IMPORTED_MODULE_5__["STORAGE_ADVISERS_TABLE"], query);

          case 8:
            result = _context6.sent;
            entities = [];

            if (result) {
              result.entries.forEach(function (element) {
                entities.push(Object(_utils__WEBPACK_IMPORTED_MODULE_7__["entityToObject"])(element));
              });
            }

            return _context6.abrupt("return", {
              isSuccess: true,
              data: entities
            });

          case 14:
            _context6.prev = 14;
            _context6.t0 = _context6["catch"](0);
            context.log.error(_context6.t0, slug);
            return _context6.abrupt("return", {
              isSuccess: false,
              error: _context6.t0
            });

          case 18:
          case "end":
            return _context6.stop();
        }
      }
    }, _callee6, this, [[0, 14]]);
  }));
  return _getAdvisersBySlug.apply(this, arguments);
}

function getCachedCandlesByKey(_x13, _x14, _x15) {
  return _getCachedCandlesByKey.apply(this, arguments);
}
/**
 * Поиск свечей ожидающих обработки для конкретного советника
 *
 * @param {*} context
 * @param {string} id
 * @returns
 */


function _getCachedCandlesByKey() {
  _getCachedCandlesByKey = _babel_runtime_helpers_asyncToGenerator__WEBPACK_IMPORTED_MODULE_2___default()(
  /*#__PURE__*/
  _babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_0___default.a.mark(function _callee7(context, key, limit) {
    var query, result, entities;
    return _babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_0___default.a.wrap(function _callee7$(_context7) {
      while (1) {
        switch (_context7.prev = _context7.next) {
          case 0:
            _context7.prev = 0;
            query = new TableQuery().where(TableQuery.stringFilter("PartitionKey", TableUtilities.QueryComparisons.EQUAL, key)).top(limit);
            _context7.next = 4;
            return Object(_storage__WEBPACK_IMPORTED_MODULE_6__["queryEntities"])(cpzStorageTables__WEBPACK_IMPORTED_MODULE_5__["STORAGE_CANDLESCACHED_TABLE"], query);

          case 4:
            result = _context7.sent;
            entities = [];

            if (result) {
              result.entries.forEach(function (element) {
                entities.push(Object(_utils__WEBPACK_IMPORTED_MODULE_7__["entityToObject"])(element));
              });
            }

            return _context7.abrupt("return", {
              isSuccess: true,
              data: entities
            });

          case 10:
            _context7.prev = 10;
            _context7.t0 = _context7["catch"](0);
            context.log.error(_context7.t0, key);
            return _context7.abrupt("return", {
              isSuccess: false,
              error: _context7.t0
            });

          case 14:
          case "end":
            return _context7.stop();
        }
      }
    }, _callee7, this, [[0, 10]]);
  }));
  return _getCachedCandlesByKey.apply(this, arguments);
}

function getPendingCandlesByAdviserId(_x16, _x17) {
  return _getPendingCandlesByAdviserId.apply(this, arguments);
}

function _getPendingCandlesByAdviserId() {
  _getPendingCandlesByAdviserId = _babel_runtime_helpers_asyncToGenerator__WEBPACK_IMPORTED_MODULE_2___default()(
  /*#__PURE__*/
  _babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_0___default.a.mark(function _callee8(context, id) {
    var query, result, entities;
    return _babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_0___default.a.wrap(function _callee8$(_context8) {
      while (1) {
        switch (_context8.prev = _context8.next) {
          case 0:
            _context8.prev = 0;
            query = new TableQuery().where(TableQuery.stringFilter("PartitionKey", TableUtilities.QueryComparisons.EQUAL, id));
            _context8.next = 4;
            return Object(_storage__WEBPACK_IMPORTED_MODULE_6__["queryEntities"])(cpzStorageTables__WEBPACK_IMPORTED_MODULE_5__["STORAGE_CANDLESPENDING_TABLE"], query);

          case 4:
            result = _context8.sent;
            entities = [];

            if (result) {
              result.entries.forEach(function (element) {
                entities.push(Object(_utils__WEBPACK_IMPORTED_MODULE_7__["entityToObject"])(element));
              });
            }

            return _context8.abrupt("return", {
              isSuccess: true,
              data: entities
            });

          case 10:
            _context8.prev = 10;
            _context8.t0 = _context8["catch"](0);
            context.log.error(_context8.t0, id);
            return _context8.abrupt("return", {
              isSuccess: false,
              error: _context8.t0
            });

          case 14:
          case "end":
            return _context8.stop();
        }
      }
    }, _callee8, this, [[0, 10]]);
  }));
  return _getPendingCandlesByAdviserId.apply(this, arguments);
}



/***/ }),

/***/ "./src/tableStorage/storage.js":
/*!*************************************!*\
  !*** ./src/tableStorage/storage.js ***!
  \*************************************/
/*! exports provided: createTableIfNotExists, insertOrMergeEntity, mergeEntity, deleteEntity, queryEntities */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "createTableIfNotExists", function() { return createTableIfNotExists; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "insertOrMergeEntity", function() { return insertOrMergeEntity; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "mergeEntity", function() { return mergeEntity; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "deleteEntity", function() { return deleteEntity; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "queryEntities", function() { return queryEntities; });
/* harmony import */ var azure_storage__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! azure-storage */ "azure-storage");
/* harmony import */ var azure_storage__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(azure_storage__WEBPACK_IMPORTED_MODULE_0__);
// TODO: Move to https://github.com/Azure/azure-storage-js when available

var tableService = azure_storage__WEBPACK_IMPORTED_MODULE_0___default.a.createTableService(process.env.AZ_STORAGE_CS);
/**
 * Создание таблицы если еще не существует
 *
 * @param {*} tableName
 * @returns
 */

function createTableIfNotExists(tableName) {
  return new Promise(function (resolve, reject) {
    tableService.createTableIfNotExists(tableName, function (error, result) {
      if (error) reject(error);
      resolve(result);
    });
  });
}
/**
 * Добавление или обновление записи в таблице
 *
 * @param {*} tableName
 * @param {*} entity
 * @returns
 */


function insertOrMergeEntity(tableName, entity) {
  return new Promise(function (resolve, reject) {
    tableService.insertOrMergeEntity(tableName, entity, function (error) {
      if (error) reject(error);
      resolve(true);
    });
  });
}
/**
 * Обновление записи в таблице
 *
 * @param {*} tableName
 * @param {*} entity
 * @returns
 */


function mergeEntity(tableName, entity) {
  return new Promise(function (resolve, reject) {
    tableService.mergeEntity(tableName, entity, function (error) {
      if (error) reject(error);
      resolve(true);
    });
  });
}
/**
 * Удаление записи из таблицы
 *
 * @param {*} tableName
 * @param {*} entity
 * @returns
 */


function deleteEntity(tableName, entity) {
  return new Promise(function (resolve, reject) {
    tableService.deleteEntity(tableName, entity, function (error) {
      if (error) reject(error);
      resolve(true);
    });
  });
}
/**
 * Выборка данных из таблицы
 *
 * @param {*} tableName
 * @param {*} tableQuery
 * @returns
 */


function queryEntities(tableName, tableQuery) {
  return new Promise(function (resolve, reject) {
    tableService.queryEntities(tableName, tableQuery, null, function (error, result) {
      if (error) reject(error);
      resolve(result);
    });
  });
}



/***/ }),

/***/ "./src/tableStorage/utils.js":
/*!***********************************!*\
  !*** ./src/tableStorage/utils.js ***!
  \***********************************/
/*! exports provided: tryParseJSON, entityToObject, objectToEntity, createSlug */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "tryParseJSON", function() { return tryParseJSON; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "entityToObject", function() { return entityToObject; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "objectToEntity", function() { return objectToEntity; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "createSlug", function() { return createSlug; });
/* harmony import */ var _babel_runtime_helpers_typeof__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/typeof */ "@babel/runtime/helpers/typeof");
/* harmony import */ var _babel_runtime_helpers_typeof__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_babel_runtime_helpers_typeof__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var azure_storage__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! azure-storage */ "azure-storage");
/* harmony import */ var azure_storage__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(azure_storage__WEBPACK_IMPORTED_MODULE_1__);


var entityGenerator = azure_storage__WEBPACK_IMPORTED_MODULE_1__["TableUtilities"].entityGenerator;

function tryParseJSON(jsonString) {
  try {
    var o = JSON.parse(jsonString);

    if (o && _babel_runtime_helpers_typeof__WEBPACK_IMPORTED_MODULE_0___default()(o) === "object") {
      return o;
    }
  } catch (e) {
    return false;
  }

  return false;
}
/**
 * Преобразовывает объект типа Azure Table Storage Entity в обычный объект JS
 *
 * @param {entity} entity
 * @returns {object}
 */


function entityToObject(entity) {
  var object = {};
  Object.keys(entity).forEach(function (key) {
    if (key === ".metadata") return;
    var json = tryParseJSON(entity[key]._);

    if (json) {
      object[key] = json;
    } else {
      object[key] = entity[key]._;
    }
  });
  return object;
}
/**
 * Преобразовывает обычный объект JS в объект типа Azure Table Storage Entity
 *
 * @param {object} object
 * @returns {entity}
 */


function objectToEntity(object) {
  var entity = {};
  Object.keys(object).forEach(function (key) {
    var element = object[key];

    if (_babel_runtime_helpers_typeof__WEBPACK_IMPORTED_MODULE_0___default()(element) === "object") {
      if (element instanceof Date) {
        entity[key] = entityGenerator.DateTime(element);
      } else {
        entity[key] = entityGenerator.String(JSON.stringify(element));
      }
    } else if (typeof element === "number") {
      entity[key] = entityGenerator.Double(element);
    } else if (typeof element === "boolean") {
      entity[key] = entityGenerator.Boolean(element);
    } else {
      entity[key] = entityGenerator.String(element);
    }
  });
  return entity;
}

function createSlug(exchange, asset, currency, timeframe) {
  return "".concat(exchange, ".").concat(asset, ".").concat(currency, ".").concat(timeframe);
}



/***/ }),

/***/ "@babel/runtime/helpers/asyncToGenerator":
/*!**********************************************************!*\
  !*** external "@babel/runtime/helpers/asyncToGenerator" ***!
  \**********************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("@babel/runtime/helpers/asyncToGenerator");

/***/ }),

/***/ "@babel/runtime/helpers/classCallCheck":
/*!********************************************************!*\
  !*** external "@babel/runtime/helpers/classCallCheck" ***!
  \********************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("@babel/runtime/helpers/classCallCheck");

/***/ }),

/***/ "@babel/runtime/helpers/createClass":
/*!*****************************************************!*\
  !*** external "@babel/runtime/helpers/createClass" ***!
  \*****************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("@babel/runtime/helpers/createClass");

/***/ }),

/***/ "@babel/runtime/helpers/getPrototypeOf":
/*!********************************************************!*\
  !*** external "@babel/runtime/helpers/getPrototypeOf" ***!
  \********************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("@babel/runtime/helpers/getPrototypeOf");

/***/ }),

/***/ "@babel/runtime/helpers/inherits":
/*!**************************************************!*\
  !*** external "@babel/runtime/helpers/inherits" ***!
  \**************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("@babel/runtime/helpers/inherits");

/***/ }),

/***/ "@babel/runtime/helpers/objectSpread":
/*!******************************************************!*\
  !*** external "@babel/runtime/helpers/objectSpread" ***!
  \******************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("@babel/runtime/helpers/objectSpread");

/***/ }),

/***/ "@babel/runtime/helpers/possibleConstructorReturn":
/*!*******************************************************************!*\
  !*** external "@babel/runtime/helpers/possibleConstructorReturn" ***!
  \*******************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("@babel/runtime/helpers/possibleConstructorReturn");

/***/ }),

/***/ "@babel/runtime/helpers/typeof":
/*!************************************************!*\
  !*** external "@babel/runtime/helpers/typeof" ***!
  \************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("@babel/runtime/helpers/typeof");

/***/ }),

/***/ "@babel/runtime/regenerator":
/*!*********************************************!*\
  !*** external "@babel/runtime/regenerator" ***!
  \*********************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("@babel/runtime/regenerator");

/***/ }),

/***/ "azure-eventgrid":
/*!**********************************!*\
  !*** external "azure-eventgrid" ***!
  \**********************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("azure-eventgrid");

/***/ }),

/***/ "azure-storage":
/*!********************************!*\
  !*** external "azure-storage" ***!
  \********************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("azure-storage");

/***/ }),

/***/ "dayjs":
/*!************************!*\
  !*** external "dayjs" ***!
  \************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("dayjs");

/***/ }),

/***/ "ms-rest-azure":
/*!********************************!*\
  !*** external "ms-rest-azure" ***!
  \********************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("ms-rest-azure");

/***/ }),

/***/ "tulind":
/*!*************************!*\
  !*** external "tulind" ***!
  \*************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("tulind");

/***/ }),

/***/ "url":
/*!**********************!*\
  !*** external "url" ***!
  \**********************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("url");

/***/ }),

/***/ "uuid":
/*!***********************!*\
  !*** external "uuid" ***!
  \***********************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("uuid");

/***/ })

/******/ });
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vLy4uL2Nwei1zaGFyZWQvY29uZmlnL2RlZmF1bHRzL2luZGV4LmpzIiwid2VicGFjazovLy8uLi9jcHotc2hhcmVkL2NvbmZpZy9ldmVudFR5cGVzL2NhbmRsZXMuanMiLCJ3ZWJwYWNrOi8vLy4uL2Nwei1zaGFyZWQvY29uZmlnL2V2ZW50VHlwZXMvZXZlbnRzLmpzIiwid2VicGFjazovLy8uLi9jcHotc2hhcmVkL2NvbmZpZy9ldmVudFR5cGVzL2luZGV4LmpzIiwid2VicGFjazovLy8uLi9jcHotc2hhcmVkL2NvbmZpZy9ldmVudFR5cGVzL3NpZ25hbHMuanMiLCJ3ZWJwYWNrOi8vLy4uL2Nwei1zaGFyZWQvY29uZmlnL2V2ZW50VHlwZXMvdGFza3MuanMiLCJ3ZWJwYWNrOi8vLy4uL2Nwei1zaGFyZWQvY29uZmlnL2V2ZW50VHlwZXMvdGlja3MuanMiLCJ3ZWJwYWNrOi8vLy4uL2Nwei1zaGFyZWQvY29uZmlnL3NlcnZpY2VzL2luZGV4LmpzIiwid2VicGFjazovLy8uLi9jcHotc2hhcmVkL2NvbmZpZy9zdGF0ZS9pbmRleC5qcyIsIndlYnBhY2s6Ly8vLi4vY3B6LXNoYXJlZC9jb25maWcvc3RhdGUvaW5kaWNhdG9ycy5qcyIsIndlYnBhY2s6Ly8vLi4vY3B6LXNoYXJlZC9jb25maWcvc3RhdGUvc3RhdHVzLmpzIiwid2VicGFjazovLy8uLi9jcHotc2hhcmVkL2NvbmZpZy9zdG9yYWdlVGFibGVzL2luZGV4LmpzIiwid2VicGFjazovLy8uL3NyYy9hZHZpc2VyL2FkdmlzZXIuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2FkdmlzZXIvYmFzZUluZGljYXRvci5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvYWR2aXNlci9iYXNlU3RyYXRlZ3kuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2FkdmlzZXIvZXhlY3V0ZS5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvYWR2aXNlci9oYW5kbGVFdmVudHMuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2V2ZW50Z3JpZC9pbmRleC5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvZnVuY3MvZnVuY1Rhc2tFdmVudHMuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2luZGljYXRvcnMgc3luYyBeXFwuXFwvLiokIiwid2VicGFjazovLy8uL3NyYy9pbmRpY2F0b3JzL0VNQS5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvbGliL3R1bGlwL2NyZWF0ZS5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvbGliL3R1bGlwL3R1bGlwSW5kaWNhdG9ycy5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvc3RyYXRlZ2llcyBzeW5jIF5cXC5cXC8uKiQiLCJ3ZWJwYWNrOi8vLy4vc3JjL3N0cmF0ZWdpZXMvU1RSX1JPQk9UXzEuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3N0cmF0ZWdpZXMvU1RSX1JPQk9UXzIuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3RhYmxlU3RvcmFnZS9pbmRleC5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvdGFibGVTdG9yYWdlL3N0b3JhZ2UuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3RhYmxlU3RvcmFnZS91dGlscy5qcyIsIndlYnBhY2s6Ly8vZXh0ZXJuYWwgXCJAYmFiZWwvcnVudGltZS9oZWxwZXJzL2FzeW5jVG9HZW5lcmF0b3JcIiIsIndlYnBhY2s6Ly8vZXh0ZXJuYWwgXCJAYmFiZWwvcnVudGltZS9oZWxwZXJzL2NsYXNzQ2FsbENoZWNrXCIiLCJ3ZWJwYWNrOi8vL2V4dGVybmFsIFwiQGJhYmVsL3J1bnRpbWUvaGVscGVycy9jcmVhdGVDbGFzc1wiIiwid2VicGFjazovLy9leHRlcm5hbCBcIkBiYWJlbC9ydW50aW1lL2hlbHBlcnMvZ2V0UHJvdG90eXBlT2ZcIiIsIndlYnBhY2s6Ly8vZXh0ZXJuYWwgXCJAYmFiZWwvcnVudGltZS9oZWxwZXJzL2luaGVyaXRzXCIiLCJ3ZWJwYWNrOi8vL2V4dGVybmFsIFwiQGJhYmVsL3J1bnRpbWUvaGVscGVycy9vYmplY3RTcHJlYWRcIiIsIndlYnBhY2s6Ly8vZXh0ZXJuYWwgXCJAYmFiZWwvcnVudGltZS9oZWxwZXJzL3Bvc3NpYmxlQ29uc3RydWN0b3JSZXR1cm5cIiIsIndlYnBhY2s6Ly8vZXh0ZXJuYWwgXCJAYmFiZWwvcnVudGltZS9oZWxwZXJzL3R5cGVvZlwiIiwid2VicGFjazovLy9leHRlcm5hbCBcIkBiYWJlbC9ydW50aW1lL3JlZ2VuZXJhdG9yXCIiLCJ3ZWJwYWNrOi8vL2V4dGVybmFsIFwiYXp1cmUtZXZlbnRncmlkXCIiLCJ3ZWJwYWNrOi8vL2V4dGVybmFsIFwiYXp1cmUtc3RvcmFnZVwiIiwid2VicGFjazovLy9leHRlcm5hbCBcImRheWpzXCIiLCJ3ZWJwYWNrOi8vL2V4dGVybmFsIFwibXMtcmVzdC1henVyZVwiIiwid2VicGFjazovLy9leHRlcm5hbCBcInR1bGluZFwiIiwid2VicGFjazovLy9leHRlcm5hbCBcInVybFwiIiwid2VicGFjazovLy9leHRlcm5hbCBcInV1aWRcIiJdLCJuYW1lcyI6WyJSRVFVSVJFRF9ISVNUT1JZX01BWF9CQVJTIiwiQ0FORExFU19ORVdDQU5ETEVfRVZFTlQiLCJldmVudFR5cGUiLCJkYXRhU2NoZW1hIiwiY2FuZGxlSWQiLCJkZXNjcmlwdGlvbiIsInR5cGUiLCJlbXB0eSIsImV4Y2hhbmdlIiwiYXNzZXQiLCJjdXJyZW5jeSIsInRpbWVmcmFtZSIsInRpbWUiLCJvcGVuIiwiY2xvc2UiLCJoaWdoIiwibG93Iiwidm9sdW1lIiwiQ0FORExFU19IQU5ETEVEX0VWRU5UIiwic2VydmljZSIsInZhbHVlcyIsInN1Y2Nlc3MiLCJpdGVtcyIsImVycm9yIiwicHJvcHMiLCJ0YXNrSWQiLCJjb2RlIiwibWVzc2FnZSIsImRldGFpbCIsIm9wdGlvbmFsIiwic3VjY2Vzc1BlbmRpbmciLCJlcnJvclBlbmRpbmciLCJCQVNFX0VWRU5UIiwiaWQiLCJ0b3BpYyIsInN1YmplY3QiLCJkYXRhIiwiZXZlbnRUaW1lIiwiZm9ybWF0IiwibWV0YWRhdGFWZXJzaW9uIiwicmVhZE9ubHkiLCJkYXRhVmVyc2lvbiIsIlNVQl9WQUxJREFUSU9OX0VWRU5UIiwiTE9HX01BUktFVFdBVENIRVJfRVZFTlQiLCJMT0dfQ0FORExFQkFUQ0hFUl9FVkVOVCIsIkxPR19BRFZJU0VSX0VWRU5UIiwiTE9HX1RSQURFUl9FVkVOVCIsIkVSUk9SX01BUktFVFdBVENIRVJfRVZFTlQiLCJFUlJPUl9DQU5ETEVCQVRDSEVSX0VWRU5UIiwiRVJST1JfQURWSVNFUl9FVkVOVCIsIkVSUk9SX1RSQURFUl9FVkVOVCIsIlNJR05BTFNfTkVXU0lHTkFMX0VWRU5UIiwic2lnbmFsSWQiLCJyb2JvdElkIiwiYWR2aXNlcklkIiwiYWxlcnRUaW1lIiwiYWN0aW9uIiwicXR5Iiwib3JkZXJUeXBlIiwicHJpY2UiLCJwcmljZVNvdXJjZSIsInBvc2l0aW9uSWQiLCJjYW5kbGUiLCJzZXR0aW5ncyIsInNsaXBwYWdlU3RlcCIsIlNJR05BTFNfSEFORExFRF9FVkVOVCIsInN1Y2Nlc3NUcmFkZXJzIiwiZXJyb3JUcmFkZXJzIiwiVEFTS1NfTUFSS0VUV0FUQ0hFUl9TVEFSVF9FVkVOVCIsIm1vZGUiLCJkZWJ1ZyIsInByb3ZpZGVyVHlwZSIsIlRBU0tTX01BUktFVFdBVENIRVJfU1RPUF9FVkVOVCIsIlRBU0tTX01BUktFVFdBVENIRVJfU1VCU0NSSUJFX0VWRU5UIiwiVEFTS1NfTUFSS0VUV0FUQ0hFUl9VTlNVQlNDUklCRV9FVkVOVCIsIlRBU0tTX01BUktFVFdBVENIRVJfU1RBUlRFRF9FVkVOVCIsInJvd0tleSIsInBhcnRpdGlvbktleSIsIlRBU0tTX01BUktFVFdBVENIRVJfU1RPUFBFRF9FVkVOVCIsIlRBU0tTX01BUktFVFdBVENIRVJfU1VCU0NSSUJFRF9FVkVOVCIsIlRBU0tTX01BUktFVFdBVENIRVJfVU5TVUJTQ1JJQkVEX0VWRU5UIiwiVEFTS1NfQ0FORExFQkFUQ0hFUl9TVEFSVF9FVkVOVCIsInRpbWVmcmFtZXMiLCJwcm94eSIsIlRBU0tTX0NBTkRMRUJBVENIRVJfU1RPUF9FVkVOVCIsIlRBU0tTX0NBTkRMRUJBVENIRVJfVVBEQVRFX0VWRU5UIiwiVEFTS1NfQ0FORExFQkFUQ0hFUl9TVEFSVEVEX0VWRU5UIiwiVEFTS1NfQ0FORExFQkFUQ0hFUl9TVE9QUEVEX0VWRU5UIiwiVEFTS1NfQ0FORExFQkFUQ0hFUl9VUERBVEVEX0VWRU5UIiwiVEFTS1NfQURWSVNFUl9TVEFSVF9FVkVOVCIsInN0cmF0ZWd5IiwiVEFTS1NfQURWSVNFUl9TVE9QX0VWRU5UIiwiVEFTS1NfQURWSVNFUl9VUERBVEVfRVZFTlQiLCJUQVNLU19BRFZJU0VSX1NUQVJURURfRVZFTlQiLCJUQVNLU19BRFZJU0VSX1NUT1BQRURfRVZFTlQiLCJUQVNLU19BRFZJU0VSX1VQREFURURfRVZFTlQiLCJUQVNLU19UUkFERVJfU1RBUlRfRVZFTlQiLCJ1c2VySWQiLCJUQVNLU19UUkFERVJfU1RPUF9FVkVOVCIsIlRBU0tTX1RSQURFUl9VUERBVEVfRVZFTlQiLCJUQVNLU19UUkFERVJfU1RBUlRFRF9FVkVOVCIsIlRBU0tTX1RSQURFUl9TVE9QUEVEX0VWRU5UIiwiVEFTS1NfVFJBREVSX1VQREFURURfRVZFTlQiLCJUSUNLU19ORVdUSUNLX0VWRU5UIiwic2lkZSIsInRyYWRlSWQiLCJUSUNLU19IQU5ETEVEX0VWRU5UIiwiQURWSVNFUl9TRVJWSUNFIiwiSU5ESUNBVE9SU19CQVNFIiwiSU5ESUNBVE9SU19UVUxJUCIsIlNUQVRVU19TVEFSVEVEIiwiU1RBVFVTX1BFTkRJTkciLCJTVEFUVVNfQlVTWSIsIlNUQVRVU19TVE9QUEVEIiwiU1RBVFVTX0VSUk9SIiwiU1RBVFVTX0ZJTklTSEVEIiwiU1RPUkFHRV9BRFZJU0VSU19UQUJMRSIsIlNUT1JBR0VfQ0FORExFU0NBQ0hFRF9UQUJMRSIsIlNUT1JBR0VfQ0FORExFU1BFTkRJTkdfVEFCTEUiLCJBZHZpc2VyIiwiY29udGV4dCIsInN0YXRlIiwiX2NvbnRleHQiLCJfZXZlbnRTdWJqZWN0IiwiZXZlbnRTdWJqZWN0IiwiX3Rhc2tJZCIsIl9yb2JvdElkIiwiX21vZGUiLCJfZGVidWciLCJfc2V0dGluZ3MiLCJfZXhjaGFuZ2UiLCJfYXNzZXQiLCJfY3VycmVuY3kiLCJfdGltZWZyYW1lIiwiX3N0cmF0ZWd5TmFtZSIsInN0cmF0ZWd5TmFtZSIsIl9yZXF1aXJlZEhpc3RvcnlDYWNoZSIsInJlcXVpcmVkSGlzdG9yeUNhY2hlIiwiX3JlcXVpcmVkSGlzdG9yeU1heEJhcnMiLCJyZXF1aXJlZEhpc3RvcnlNYXhCYXJzIiwiX3N0cmF0ZWd5IiwidmFyaWFibGVzIiwiX2luZGljYXRvcnMiLCJpbmRpY2F0b3JzIiwiX2NhbmRsZSIsIl9sYXN0Q2FuZGxlIiwibGFzdENhbmRsZSIsIl9zaWduYWxzIiwiX2xhc3RTaWduYWxzIiwibGFzdFNpZ25hbHMiLCJfdXBkYXRlUmVxdWVzdGVkIiwidXBkYXRlUmVxdWVzdGVkIiwiX3N0b3BSZXF1ZXN0ZWQiLCJzdG9wUmVxdWVzdGVkIiwiX3N0YXR1cyIsInN0YXR1cyIsIl9zdGFydGVkQXQiLCJzdGFydGVkQXQiLCJkYXlqcyIsInRvSlNPTiIsIl9lbmRlZEF0IiwiZW5kZWRBdCIsIl9pbml0aWFsaXplZCIsImluaXRpYWxpemVkIiwibG9hZFN0cmF0ZWd5IiwibG9hZEluZGljYXRvcnMiLCJpbml0U3RyYXRlZ3kiLCJzdHJhdGVneU9iamVjdCIsInJlcXVpcmUiLCJsb2ciLCJKU09OIiwic3RyaW5naWZ5Iiwic3RyYXRlZ3lGdW5jdGlvbnMiLCJPYmplY3QiLCJnZXRPd25Qcm9wZXJ0eU5hbWVzIiwiZmlsdGVyIiwia2V5IiwiZm9yRWFjaCIsIl9zdHJhdGVneUluc3RhbmNlIiwiQmFzZVN0cmF0ZWd5IiwiYWR2aWNlIiwiYmluZCIsImxvZ0V2ZW50IiwiRXJyb3IiLCJrZXlzIiwiaW5kaWNhdG9yIiwiaW5kaWNhdG9yT2JqZWN0IiwiZmlsZU5hbWUiLCJpbmRpY2F0b3JGdW5jdGlvbnMiLCJvd25Qcm9wIiwiQmFzZUluZGljYXRvciIsImVyciIsIlR1bGlwSW5kaWNhdG9yQ2xhc3MiLCJvcHRpb25zIiwiaW5pdCIsImluaXRJbmRpY2F0b3JzIiwiUHJvbWlzZSIsImFsbCIsIm1hcCIsImhhbmRsZUNhbmRsZSIsIl9jYW5kbGVzIiwiX2NhbmRsZXNQcm9wcyIsImNhbGMiLCJhcmdzIiwiaW5mbyIsInB1Ymxpc2hFdmVudHMiLCJjcmVhdGVFdmVudHMiLCJ1cGRhdGVkRmllbGRzIiwiZ2V0Q2FjaGVkQ2FuZGxlc0J5S2V5IiwicmVzdWx0IiwiaXNTdWNjZXNzIiwicmV2ZXJzZSIsInB1c2giLCJfbG9hZENhbmRsZXMiLCJfcHJlcGFyZUNhbmRsZXMiLCJjYWxjSW5kaWNhdG9ycyIsImdldEluZGljYXRvcnNTdGF0ZSIsImNoZWNrIiwibW9kZVRvU3RyIiwic2lnbmFsIiwibmV3U2lnbmFsIiwidXVpZCIsIkRhdGUiLCJfY3JlYXRlU3ViamVjdCIsImFkdmlzb3JJZCIsImluZCIsInN0YXJ0c1dpdGgiLCJzYXZlQWR2aXNlclN0YXRlIiwiY3VycmVudFN0YXRlIiwiX2Vycm9yIiwic2F2ZSIsImdldFN0cmF0ZWd5U3RhdGUiLCJfbmFtZSIsIm5hbWUiLCJfaW5kaWNhdG9yTmFtZSIsImluZGljYXRvck5hbWUiLCJfb3B0aW9ucyIsIl90dWxpcEluZGljYXRvcnMiLCJ0dWxpcEluZGljYXRvcnMiLCJfbG9nIiwiX2xvZ0V2ZW50IiwicmVzb2x2ZSIsImNhbmRsZXMiLCJjYW5kbGVzUHJvcHMiLCJfaGFuZGxlQ2FuZGxlIiwidmFsdWUiLCJf0YF1cnJlbmN5IiwiX2FkdmljZSIsInZhcmlhYmxlIiwiX2FkZEluZGljYXRvciIsIl9hZGRUdWxpcEluZGljYXRvciIsImV4ZWN1dGUiLCJhZHZpc2VyIiwiZW5kIiwic2V0VXBkYXRlIiwiZXZlbnRzIiwibGVuZ3RoIiwicHVibGlzaEV2ZW50c1Jlc3VsdCIsImhhbmRsZVN0YXJ0IiwiZXZlbnREYXRhIiwiY3JlYXRlU2x1ZyIsImhhbmRsZVN0b3AiLCJnZXRBZHZpc2VyQnlLZXkiLCJnZXRBZHZpc2VyUmVzdWx0IiwiYWR2aXNlclN0YXRlIiwibmV3U3RhdGUiLCJSb3dLZXkiLCJQYXJ0aXRpb25LZXkiLCJ1cGRhdGVBZHZpc2VyU3RhdGUiLCJoYW5kbGVVcGRhdGUiLCJnZXRDYW5kbGViYXRjaGVyUmVzdWx0IiwiY2FuZGxlYmF0Y2hlclN0YXRlIiwic2x1ZyIsImdldEFkdmlzZXJzQnlTbHVnIiwiZ2V0QWR2aXNlcnNSZXN1bHQiLCJhZHZpc2VycyIsInN0YXJ0ZWRBZHZpc2VycyIsImJ1c3lBZHZpc2VycyIsImFkdmlzZXJFeGVjdXRpb25SZXN1bHRzIiwibmV3UGVuZGluZ0NhbmRsZSIsInNhdmVQZW5kaW5nQ2FuZGxlcyIsInBlbmRpbmdDYW5kbGVzUmVzdWx0cyIsInN1Y2Nlc3NBZHZpc2VycyIsImVycm9yQWR2aXNlcnMiLCJzdWNjZXNzUGVuZGluZ0FkdmlzZXJzIiwiZXJyb3JQZW5kaW5nQWR2aXNlcnMiLCJjcmVhdGVDbGllbnQiLCJFdmVudEdyaWQiLCJtc1Jlc3RBenVyZSIsIlRvcGljQ3JlZGVudGlhbHMiLCJnZXRIb3N0IiwiZW5kcG9pbnQiLCJ1cmwiLCJwYXJzZSIsImhvc3QiLCJ0b3BpY3MiLCJ0YXNrcyIsImNsaWVudCIsInByb2Nlc3MiLCJlbnYiLCJFR19UQVNLU19LRVkiLCJFR19URVNUX0tFWSIsIkVHX1RBU0tTX0VORFBPSU5UIiwiRUdfVEVTVF9FTkRQT0lOVCIsIkVHX0NBTkRMRVNfS0VZIiwiRUdfQ0FORExFU19FTkRQT0lOVCIsInNpZ25hbHMiLCJFR19TSUdOQUxTX0tFWSIsIkVHX1NJR05BTFNfRU5EUE9JTlQiLCJFR19MT0dfS0VZIiwiRUdfTE9HX0VORFBPSU5UIiwibmV3RXZlbnQiLCJldmVudEhhbmRsZXIiLCJyZXEiLCJwYXJzZWRSZXEiLCJyYXdCb2R5IiwiZXZlbnRHcmlkRXZlbnQiLCJ3YXJuIiwidmFsaWRhdGlvbkNvZGUiLCJyZXMiLCJib2R5IiwidmFsaWRhdGlvblJlc3BvbnNlIiwiaGVhZGVycyIsImRvbmUiLCJFTUEiLCJpbnB1dCIsIndlaWdodCIsImFnZSIsImsiLCJ5IiwibW9kdWxlIiwiZXhwb3J0cyIsImlzTnVtZXJpYyIsIm9iaiIsIkFycmF5IiwiaXNBcnJheSIsInBhcnNlRmxvYXQiLCJtZXRob2RzIiwicGFyYW1zIiwiaW5wdXRzIiwicmVzdWx0cyIsImkiLCJhcnIiLCJ2ZXJpZnlQYXJhbXMiLCJtZXRob2ROYW1lIiwicmVxdWlyZWRQYXJhbXMiLCJyZXF1aXJlcyIsInBhcmFtTmFtZSIsInByb3RvdHlwZSIsImhhc093blByb3BlcnR5IiwiY2FsbCIsInZhbCIsImFkIiwiY3JlYXRlIiwidHVsaW5kIiwiYWRvc2MiLCJvcHRJbkZhc3RQZXJpb2QiLCJvcHRJblNsb3dQZXJpb2QiLCJhZHgiLCJvcHRJblRpbWVQZXJpb2QiLCJhZHhyIiwiYW8iLCJhcG8iLCJhcm9vbiIsImFyb29ub3NjIiwiYXRyIiwiYXZncHJpY2UiLCJiYmFuZHMiLCJvcHRJbk5iU3RkRGV2cyIsImJvcCIsImNjaSIsImNtbyIsImN2aSIsImRlbWEiLCJkaSIsImRtIiwiZHBvIiwiZHgiLCJlbWEiLCJlbXYiLCJmaXNoZXIiLCJmb3NjIiwiaG1hIiwia2FtYSIsImt2byIsImxpbnJlZyIsImxpbnJlZ2ludGVyY2VwdCIsImxpbnJlZ3Nsb3BlIiwibWFjZCIsIm9wdEluU2lnbmFsUGVyaW9kIiwibWFya2V0ZmkiLCJtYXNzIiwibWVkcHJpY2UiLCJtZmkiLCJtc3ciLCJuYXRyIiwibnZpIiwib2J2IiwicHBvIiwicHNhciIsIm9wdEluQWNjZWxlcmF0aW9uIiwib3B0SW5NYXhpbXVtIiwicHZpIiwicXN0aWNrIiwicm9jIiwicm9jciIsInJzaSIsInNtYSIsInN0ZGRldiIsInN0b2NoIiwib3B0SW5GYXN0S1BlcmlvZCIsIm9wdEluU2xvd0tQZXJpb2QiLCJvcHRJblNsb3dEUGVyaW9kIiwic3VtIiwidGVtYSIsInRyIiwidHJpbWEiLCJ0cml4IiwidHNmIiwidHlwcHJpY2UiLCJ1bHRvc2MiLCJvcHRJblRpbWVQZXJpb2QxIiwib3B0SW5UaW1lUGVyaW9kMiIsIm9wdEluVGltZVBlcmlvZDMiLCJ2aGYiLCJ2aWR5YSIsIm9wdEluQWxwaGEiLCJ2b2xhdGlsaXR5Iiwidm9zYyIsInZ3bWEiLCJ3YWQiLCJ3Y3ByaWNlIiwid2lsZGVycyIsIndpbGxyIiwid21hIiwiemxlbWEiLCJUdWxpcCIsImNhbGN1bGF0ZSIsInR1bGlwIiwicmVzdWx0S2V5cyIsIlN0clJvYm90MSIsInVzZXJEZWZpbmVkRnVuYyIsInVzZXJEZWZpbmVkVmFyIiwibXlJbml0aWFsVmFyIiwic29tZSIsImFkZEluZGljYXRvciIsIk15RU1BIiwidG9JU09TdHJpbmciLCJTdHJSb2JvdDIiLCJhZGRUdWxpcEluZGljYXRvciIsIm15RU1BIiwiVGFibGVRdWVyeSIsImF6dXJlIiwiVGFibGVVdGlsaXRpZXMiLCJlbnRpdHlHZW5lcmF0b3IiLCJjcmVhdGVUYWJsZUlmTm90RXhpc3RzIiwiZW50aXR5IiwiU3RyaW5nIiwib2JqZWN0VG9FbnRpdHkiLCJpbnNlcnRPck1lcmdlRW50aXR5IiwiZW50aXR5VXBkYXRlZCIsInRvU3RyaW5nIiwibWVyZ2VFbnRpdHkiLCJkZWxldGVQZW5kaW5nQ2FuZGxlcyIsImRlbGV0ZUVudGl0eSIsImVudGl0eURlbGV0ZWQiLCJyb3dLZXlGaWx0ZXIiLCJzdHJpbmdGaWx0ZXIiLCJRdWVyeUNvbXBhcmlzb25zIiwiRVFVQUwiLCJwYXJ0aXRpb25LZXlGaWx0ZXIiLCJxdWVyeSIsIndoZXJlIiwiY29tYmluZUZpbHRlcnMiLCJUYWJsZU9wZXJhdG9ycyIsIkFORCIsInF1ZXJ5RW50aXRpZXMiLCJlbnRpdGllcyIsImVudHJpZXMiLCJlbGVtZW50IiwiZW50aXR5VG9PYmplY3QiLCJzdGFydGVkU3RhdHVzRmlsdGVyIiwiYnVkeVN0YXR1c0ZpbHRlciIsInN0YXR1c0ZpbHRlciIsIk9SIiwibGltaXQiLCJ0b3AiLCJnZXRQZW5kaW5nQ2FuZGxlc0J5QWR2aXNlcklkIiwidGFibGVTZXJ2aWNlIiwiY3JlYXRlVGFibGVTZXJ2aWNlIiwiQVpfU1RPUkFHRV9DUyIsInRhYmxlTmFtZSIsInJlamVjdCIsInRhYmxlUXVlcnkiLCJ0cnlQYXJzZUpTT04iLCJqc29uU3RyaW5nIiwibyIsImUiLCJvYmplY3QiLCJqc29uIiwiXyIsIkRhdGVUaW1lIiwiRG91YmxlIiwiQm9vbGVhbiJdLCJtYXBwaW5ncyI6Ijs7O0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFlBQUk7QUFDSjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGNBQU07QUFDTjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxjQUFNO0FBQ047QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQUs7O0FBRUw7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EscUNBQTZCO0FBQzdCLHFDQUE2QjtBQUM3QjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSw2QkFBcUIsZ0JBQWdCO0FBQ3JDO0FBQ0E7QUFDQSxhQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0EsNkJBQXFCLGdCQUFnQjtBQUNyQztBQUNBO0FBQ0EsYUFBSztBQUNMO0FBQ0E7QUFDQSxhQUFLO0FBQ0w7QUFDQTtBQUNBLGFBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQSxhQUFLOztBQUVMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQUs7QUFDTDtBQUNBO0FBQ0EsYUFBSztBQUNMO0FBQ0E7QUFDQTtBQUNBLGFBQUs7O0FBRUw7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLDBCQUFrQiw4QkFBOEI7QUFDaEQ7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsWUFBSTtBQUNKOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsWUFBSTtBQUNKO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsY0FBTTtBQUNOO0FBQ0E7QUFDQTtBQUNBLGVBQU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBLFlBQUk7QUFDSjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsNEJBQW9CLDJCQUEyQjtBQUMvQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZUFBTztBQUNQO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSwyQkFBbUIsY0FBYztBQUNqQztBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0Esd0JBQWdCLEtBQUs7QUFDckI7QUFDQTtBQUNBO0FBQ0EsY0FBTTtBQUNOO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx3QkFBZ0IsWUFBWTtBQUM1QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLHNCQUFjLDRCQUE0QjtBQUMxQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsY0FBTTtBQUNOOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFlBQUk7O0FBRUo7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQSx1QkFBZSw0QkFBNEI7QUFDM0M7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQSx1QkFBZSw0QkFBNEI7QUFDM0M7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHlCQUFpQix1Q0FBdUM7QUFDeEQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx5QkFBaUIsdUNBQXVDO0FBQ3hEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EseUJBQWlCLHNCQUFzQjtBQUN2QztBQUNBO0FBQ0E7QUFDQSxnQkFBUTtBQUNSO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGtCQUFVO0FBQ1Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0Esc0JBQWMsd0NBQXdDO0FBQ3REO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0EsZUFBTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlCQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsY0FBTTtBQUNOO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxnQkFBUTtBQUNSO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsWUFBSTtBQUNKOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsdUJBQWU7QUFDZjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOzs7QUFHQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0Esa0RBQTBDLGdDQUFnQztBQUMxRTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLGdFQUF3RCxrQkFBa0I7QUFDMUU7QUFDQSx5REFBaUQsY0FBYztBQUMvRDs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaURBQXlDLGlDQUFpQztBQUMxRSx3SEFBZ0gsbUJBQW1CLEVBQUU7QUFDckk7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxtQ0FBMkIsMEJBQTBCLEVBQUU7QUFDdkQseUNBQWlDLGVBQWU7QUFDaEQ7QUFDQTtBQUNBOztBQUVBO0FBQ0EsOERBQXNELCtEQUErRDs7QUFFckg7QUFDQTs7QUFFQTtBQUNBLDhDQUFzQyx1QkFBdUI7OztBQUc3RDtBQUNBOzs7Ozs7Ozs7Ozs7O0FDNXVCQTtBQUFBO0FBQUEsSUFBTUEseUJBQXlCLEdBQUcsR0FBbEMsQyxDQUF1Qzs7Ozs7Ozs7Ozs7Ozs7QUNBdkM7QUFBQTtBQUFBO0FBQUEsSUFBTUMsdUJBQXVCLEdBQUc7QUFDOUJDLFdBQVMsRUFBRSx1QkFEbUI7QUFHOUJDLFlBQVUsRUFBRTtBQUNWQyxZQUFRLEVBQUU7QUFBRUMsaUJBQVcsRUFBRSxpQkFBZjtBQUFrQ0MsVUFBSSxFQUFFLFFBQXhDO0FBQWtEQyxXQUFLLEVBQUU7QUFBekQsS0FEQTtBQUVWQyxZQUFRLEVBQUU7QUFBRUgsaUJBQVcsRUFBRSxnQkFBZjtBQUFpQ0MsVUFBSSxFQUFFLFFBQXZDO0FBQWlEQyxXQUFLLEVBQUU7QUFBeEQsS0FGQTtBQUdWRSxTQUFLLEVBQUU7QUFBRUosaUJBQVcsRUFBRSxnQkFBZjtBQUFpQ0MsVUFBSSxFQUFFLFFBQXZDO0FBQWlEQyxXQUFLLEVBQUU7QUFBeEQsS0FIRztBQUlWRyxZQUFRLEVBQUU7QUFBRUwsaUJBQVcsRUFBRSxpQkFBZjtBQUFrQ0MsVUFBSSxFQUFFLFFBQXhDO0FBQWtEQyxXQUFLLEVBQUU7QUFBekQsS0FKQTtBQUtWSSxhQUFTLEVBQUU7QUFDVE4saUJBQVcsRUFBRSx1QkFESjtBQUVUQyxVQUFJLEVBQUU7QUFGRyxLQUxEO0FBU1ZNLFFBQUksRUFBRTtBQUFFUCxpQkFBVyxFQUFFLHlCQUFmO0FBQTBDQyxVQUFJLEVBQUU7QUFBaEQsS0FUSTtBQVVWTyxRQUFJLEVBQUU7QUFBRVIsaUJBQVcsRUFBRSxvQkFBZjtBQUFxQ0MsVUFBSSxFQUFFO0FBQTNDLEtBVkk7QUFXVlEsU0FBSyxFQUFFO0FBQUVULGlCQUFXLEVBQUUscUJBQWY7QUFBc0NDLFVBQUksRUFBRTtBQUE1QyxLQVhHO0FBWVZTLFFBQUksRUFBRTtBQUFFVixpQkFBVyxFQUFFLHVCQUFmO0FBQXdDQyxVQUFJLEVBQUU7QUFBOUMsS0FaSTtBQWFWVSxPQUFHLEVBQUU7QUFBRVgsaUJBQVcsRUFBRSxxQkFBZjtBQUFzQ0MsVUFBSSxFQUFFO0FBQTVDLEtBYks7QUFjVlcsVUFBTSxFQUFFO0FBQUVaLGlCQUFXLEVBQUUsZ0JBQWY7QUFBaUNDLFVBQUksRUFBRTtBQUF2QztBQWRFO0FBSGtCLENBQWhDO0FBb0JBLElBQU1ZLHFCQUFxQixHQUFHO0FBQzVCaEIsV0FBUyxFQUFFLHFCQURpQjtBQUc1QkMsWUFBVSxFQUFFO0FBQ1ZDLFlBQVEsRUFBRTtBQUFFQyxpQkFBVyxFQUFFLGlCQUFmO0FBQWtDQyxVQUFJLEVBQUUsUUFBeEM7QUFBa0RDLFdBQUssRUFBRTtBQUF6RCxLQURBO0FBRVZZLFdBQU8sRUFBRTtBQUNQZCxpQkFBVyxFQUFFLDZCQUROO0FBRVBDLFVBQUksRUFBRSxRQUZDO0FBR1BjLFlBQU0sRUFBRSxDQUFDLFNBQUQsRUFBWSxRQUFaO0FBSEQsS0FGQztBQU9WQyxXQUFPLEVBQUU7QUFDUGhCLGlCQUFXLEVBQUUsd0JBRE47QUFFUEMsVUFBSSxFQUFFLE9BRkM7QUFHUGdCLFdBQUssRUFBRTtBQUhBLEtBUEM7QUFZVkMsU0FBSyxFQUFFO0FBQ0xsQixpQkFBVyxFQUFFLHNCQURSO0FBRUxDLFVBQUksRUFBRSxPQUZEO0FBR0xnQixXQUFLLEVBQUU7QUFDTGhCLFlBQUksRUFBRSxRQUREO0FBRUxrQixhQUFLLEVBQUU7QUFDTEMsZ0JBQU0sRUFBRTtBQUFFbkIsZ0JBQUksRUFBRSxRQUFSO0FBQWtCQyxpQkFBSyxFQUFFO0FBQXpCLFdBREg7QUFFTGdCLGVBQUssRUFBRTtBQUNMakIsZ0JBQUksRUFBRSxRQUREO0FBRUxELHVCQUFXLEVBQUUsdUNBRlI7QUFHTG1CLGlCQUFLLEVBQUU7QUFDTEUsa0JBQUksRUFBRTtBQUNKckIsMkJBQVcsRUFBRSxhQURUO0FBRUpDLG9CQUFJLEVBQUUsUUFGRjtBQUdKQyxxQkFBSyxFQUFFO0FBSEgsZUFERDtBQU1Mb0IscUJBQU8sRUFBRTtBQUNQdEIsMkJBQVcsRUFBRSxnQkFETjtBQUVQQyxvQkFBSSxFQUFFLFFBRkM7QUFHUEMscUJBQUssRUFBRTtBQUhBLGVBTko7QUFXTHFCLG9CQUFNLEVBQUU7QUFDTnZCLDJCQUFXLEVBQUUsZUFEUDtBQUVOQyxvQkFBSSxFQUFFLFFBRkE7QUFHTnVCLHdCQUFRLEVBQUUsSUFISjtBQUlOdEIscUJBQUssRUFBRTtBQUpEO0FBWEgsYUFIRjtBQXFCTHNCLG9CQUFRLEVBQUU7QUFyQkw7QUFGRjtBQUZGO0FBSEY7QUFaRyxHQUhnQjtBQWlENUJDLGdCQUFjLEVBQUU7QUFDZHpCLGVBQVcsRUFBRSxxQkFEQztBQUVkQyxRQUFJLEVBQUUsT0FGUTtBQUdkZ0IsU0FBSyxFQUFFO0FBSE8sR0FqRFk7QUFzRDVCUyxjQUFZLEVBQUU7QUFDWjFCLGVBQVcsRUFBRSxtQkFERDtBQUVaQyxRQUFJLEVBQUUsT0FGTTtBQUdaZ0IsU0FBSyxFQUFFO0FBQ0xoQixVQUFJLEVBQUUsUUFERDtBQUVMa0IsV0FBSyxFQUFFO0FBQ0xDLGNBQU0sRUFBRTtBQUFFbkIsY0FBSSxFQUFFLFFBQVI7QUFBa0JDLGVBQUssRUFBRTtBQUF6QixTQURIO0FBRUxnQixhQUFLLEVBQUU7QUFDTGpCLGNBQUksRUFBRSxRQUREO0FBRUxELHFCQUFXLEVBQUUsdUNBRlI7QUFHTG1CLGVBQUssRUFBRTtBQUNMRSxnQkFBSSxFQUFFO0FBQ0pyQix5QkFBVyxFQUFFLGFBRFQ7QUFFSkMsa0JBQUksRUFBRSxRQUZGO0FBR0pDLG1CQUFLLEVBQUU7QUFISCxhQUREO0FBTUxvQixtQkFBTyxFQUFFO0FBQ1B0Qix5QkFBVyxFQUFFLGdCQUROO0FBRVBDLGtCQUFJLEVBQUUsUUFGQztBQUdQQyxtQkFBSyxFQUFFO0FBSEEsYUFOSjtBQVdMcUIsa0JBQU0sRUFBRTtBQUNOdkIseUJBQVcsRUFBRSxlQURQO0FBRU5DLGtCQUFJLEVBQUUsUUFGQTtBQUdOdUIsc0JBQVEsRUFBRSxJQUhKO0FBSU50QixtQkFBSyxFQUFFO0FBSkQ7QUFYSCxXQUhGO0FBcUJMc0Isa0JBQVEsRUFBRTtBQXJCTDtBQUZGO0FBRkY7QUFISztBQXREYyxDQUE5Qjs7Ozs7Ozs7Ozs7OztBQ3BCQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsSUFBTUcsVUFBVSxHQUFHO0FBQ2pCQyxJQUFFLEVBQUU7QUFDRjVCLGVBQVcsRUFBRSxxQ0FEWDtBQUVGQyxRQUFJLEVBQUUsUUFGSjtBQUdGQyxTQUFLLEVBQUU7QUFITCxHQURhO0FBTWpCMkIsT0FBSyxFQUFFO0FBQ0w3QixlQUFXLEVBQUUsd0NBRFI7QUFFTEMsUUFBSSxFQUFFLFFBRkQ7QUFHTEMsU0FBSyxFQUFFO0FBSEYsR0FOVTtBQVdqQjRCLFNBQU8sRUFBRTtBQUNQOUIsZUFBVyxFQUFFLDZDQUROO0FBRVBDLFFBQUksRUFBRSxRQUZDO0FBR1BDLFNBQUssRUFBRTtBQUhBLEdBWFE7QUFnQmpCNkIsTUFBSSxFQUFFO0FBQ0ovQixlQUFXLEVBQUUsd0NBRFQ7QUFFSkMsUUFBSSxFQUFFLFFBRkY7QUFHSkMsU0FBSyxFQUFFO0FBSEgsR0FoQlc7QUFxQmpCTCxXQUFTLEVBQUU7QUFDVEcsZUFBVyxFQUFFLHNDQURKO0FBRVRDLFFBQUksRUFBRSxRQUZHO0FBR1RDLFNBQUssRUFBRTtBQUhFLEdBckJNO0FBMEJqQjhCLFdBQVMsRUFBRTtBQUNUaEMsZUFBVyxFQUFFLDRDQURKO0FBRVRpQyxVQUFNLEVBQUUsV0FGQztBQUdUaEMsUUFBSSxFQUFFLFFBSEc7QUFJVEMsU0FBSyxFQUFFO0FBSkUsR0ExQk07QUFnQ2pCZ0MsaUJBQWUsRUFBRTtBQUNmbEMsZUFBVyxFQUFFLDJDQURFO0FBRWZtQyxZQUFRLEVBQUUsSUFGSztBQUdmbEMsUUFBSSxFQUFFLFFBSFM7QUFJZkMsU0FBSyxFQUFFO0FBSlEsR0FoQ0E7QUFzQ2pCa0MsYUFBVyxFQUFFO0FBQ1hwQyxlQUFXLEVBQUUsd0NBREY7QUFFWEMsUUFBSSxFQUFFLFFBRks7QUFHWEMsU0FBSyxFQUFFO0FBSEk7QUF0Q0ksQ0FBbkI7QUE0Q0EsSUFBTW1DLG9CQUFvQixHQUFHO0FBQzNCeEMsV0FBUyxFQUFFO0FBRGdCLENBQTdCO0FBSUEsSUFBTXlDLHVCQUF1QixHQUFHO0FBQzlCekMsV0FBUyxFQUFFO0FBRG1CLENBQWhDO0FBSUEsSUFBTTBDLHVCQUF1QixHQUFHO0FBQzlCMUMsV0FBUyxFQUFFO0FBRG1CLENBQWhDO0FBSUEsSUFBTTJDLGlCQUFpQixHQUFHO0FBQ3hCM0MsV0FBUyxFQUFFO0FBRGEsQ0FBMUI7QUFJQSxJQUFNNEMsZ0JBQWdCLEdBQUc7QUFDdkI1QyxXQUFTLEVBQUU7QUFEWSxDQUF6QjtBQUlBLElBQU02Qyx5QkFBeUIsR0FBRztBQUNoQzdDLFdBQVMsRUFBRTtBQURxQixDQUFsQztBQUlBLElBQU04Qyx5QkFBeUIsR0FBRztBQUNoQzlDLFdBQVMsRUFBRTtBQURxQixDQUFsQztBQUlBLElBQU0rQyxtQkFBbUIsR0FBRztBQUMxQi9DLFdBQVMsRUFBRTtBQURlLENBQTVCO0FBSUEsSUFBTWdELGtCQUFrQixHQUFHO0FBQ3pCaEQsV0FBUyxFQUFFO0FBRGMsQ0FBM0I7Ozs7Ozs7Ozs7Ozs7QUM1RUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7Ozs7Ozs7QUNIQTtBQUFBO0FBQUE7QUFBQSxJQUFNaUQsdUJBQXVCLEdBQUc7QUFDOUJqRCxXQUFTLEVBQUUsdUJBRG1CO0FBRTlCaUMsU0FBTyxFQUNMLHNFQUg0QjtBQUk5QmhDLFlBQVUsRUFBRTtBQUNWaUQsWUFBUSxFQUFFO0FBQUUvQyxpQkFBVyxFQUFFLGlCQUFmO0FBQWtDQyxVQUFJLEVBQUUsUUFBeEM7QUFBa0RDLFdBQUssRUFBRTtBQUF6RCxLQURBO0FBRVZDLFlBQVEsRUFBRTtBQUFFSCxpQkFBVyxFQUFFLGdCQUFmO0FBQWlDQyxVQUFJLEVBQUUsUUFBdkM7QUFBaURDLFdBQUssRUFBRTtBQUF4RCxLQUZBO0FBR1ZFLFNBQUssRUFBRTtBQUFFSixpQkFBVyxFQUFFLGdCQUFmO0FBQWlDQyxVQUFJLEVBQUUsUUFBdkM7QUFBaURDLFdBQUssRUFBRTtBQUF4RCxLQUhHO0FBSVZHLFlBQVEsRUFBRTtBQUFFTCxpQkFBVyxFQUFFLGlCQUFmO0FBQWtDQyxVQUFJLEVBQUUsUUFBeEM7QUFBa0RDLFdBQUssRUFBRTtBQUF6RCxLQUpBO0FBS1ZJLGFBQVMsRUFBRTtBQUNUTixpQkFBVyxFQUFFLHVCQURKO0FBRVRDLFVBQUksRUFBRTtBQUZHLEtBTEQ7QUFTVitDLFdBQU8sRUFBRTtBQUNQaEQsaUJBQVcsRUFBRSxnQkFETjtBQUVQQyxVQUFJLEVBQUUsUUFGQztBQUdQQyxXQUFLLEVBQUU7QUFIQSxLQVRDO0FBY1YrQyxhQUFTLEVBQUU7QUFDVGpELGlCQUFXLEVBQUUsa0JBREo7QUFFVEMsVUFBSSxFQUFFLFFBRkc7QUFHVEMsV0FBSyxFQUFFO0FBSEUsS0FkRDtBQW1CVmdELGFBQVMsRUFBRTtBQUNUbEQsaUJBQVcsRUFBRSx5QkFESjtBQUVUQyxVQUFJLEVBQUU7QUFGRyxLQW5CRDtBQXVCVmtELFVBQU0sRUFBRTtBQUNObkQsaUJBQVcsRUFBRSxjQURQO0FBRU5DLFVBQUksRUFBRSxRQUZBO0FBR05jLFlBQU0sRUFBRSxDQUFDLE1BQUQsRUFBUyxXQUFULEVBQXNCLE9BQXRCLEVBQStCLFlBQS9CO0FBSEYsS0F2QkU7QUE0QlZxQyxPQUFHLEVBQUU7QUFDSHBELGlCQUFXLEVBQUUsU0FEVjtBQUVIQyxVQUFJLEVBQUUsUUFGSDtBQUdIdUIsY0FBUSxFQUFFO0FBSFAsS0E1Qks7QUFpQ1Y2QixhQUFTLEVBQUU7QUFDVHJELGlCQUFXLEVBQUUsYUFESjtBQUVUQyxVQUFJLEVBQUUsUUFGRztBQUdUYyxZQUFNLEVBQUUsQ0FBQyxNQUFELEVBQVMsT0FBVCxFQUFrQixRQUFsQixDQUhDO0FBSVRTLGNBQVEsRUFBRTtBQUpELEtBakNEO0FBdUNWOEIsU0FBSyxFQUFFO0FBQ0x0RCxpQkFBVyxFQUFFLDBCQURSO0FBRUxDLFVBQUksRUFBRTtBQUZELEtBdkNHO0FBMkNWc0QsZUFBVyxFQUFFO0FBQ1h2RCxpQkFBVyxFQUFFLGVBREY7QUFFWEMsVUFBSSxFQUFFLFFBRks7QUFHWGMsWUFBTSxFQUFFLENBQUMsTUFBRCxFQUFTLE9BQVQsRUFBa0IsTUFBbEIsRUFBMEIsS0FBMUIsRUFBaUMsTUFBakM7QUFIRyxLQTNDSDtBQWdEVnlDLGNBQVUsRUFBRTtBQUNWeEQsaUJBQVcsRUFBRSxrQkFESDtBQUVWQyxVQUFJLEVBQUU7QUFGSSxLQWhERjtBQW9EVndELFVBQU0sRUFBRTtBQUNOekQsaUJBQVcsRUFBRSxxQkFEUDtBQUVOQyxVQUFJLEVBQUUsUUFGQTtBQUdOa0IsV0FBSyxFQUFFO0FBQ0xaLFlBQUksRUFBRTtBQUFFUCxxQkFBVyxFQUFFLHlCQUFmO0FBQTBDQyxjQUFJLEVBQUU7QUFBaEQsU0FERDtBQUVMTyxZQUFJLEVBQUU7QUFBRVIscUJBQVcsRUFBRSxvQkFBZjtBQUFxQ0MsY0FBSSxFQUFFO0FBQTNDLFNBRkQ7QUFHTFEsYUFBSyxFQUFFO0FBQUVULHFCQUFXLEVBQUUscUJBQWY7QUFBc0NDLGNBQUksRUFBRTtBQUE1QyxTQUhGO0FBSUxTLFlBQUksRUFBRTtBQUFFVixxQkFBVyxFQUFFLHVCQUFmO0FBQXdDQyxjQUFJLEVBQUU7QUFBOUMsU0FKRDtBQUtMVSxXQUFHLEVBQUU7QUFBRVgscUJBQVcsRUFBRSxxQkFBZjtBQUFzQ0MsY0FBSSxFQUFFO0FBQTVDLFNBTEE7QUFNTFcsY0FBTSxFQUFFO0FBQUVaLHFCQUFXLEVBQUUsZ0JBQWY7QUFBaUNDLGNBQUksRUFBRTtBQUF2QztBQU5ILE9BSEQ7QUFXTnVCLGNBQVEsRUFBRTtBQVhKLEtBcERFO0FBaUVWa0MsWUFBUSxFQUFFO0FBQ1IxRCxpQkFBVyxFQUFFLG9CQURMO0FBRVJDLFVBQUksRUFBRSxRQUZFO0FBR1JrQixXQUFLLEVBQUU7QUFDTHdDLG9CQUFZLEVBQUU7QUFDWjNELHFCQUFXLEVBQUUsc0JBREQ7QUFFWkMsY0FBSSxFQUFFO0FBRk0sU0FEVDtBQUtMVyxjQUFNLEVBQUU7QUFDTloscUJBQVcsRUFBRSxtQkFEUDtBQUVOQyxjQUFJLEVBQUU7QUFGQTtBQUxILE9BSEM7QUFhUnVCLGNBQVEsRUFBRTtBQWJGO0FBakVBO0FBSmtCLENBQWhDO0FBc0ZBLElBQU1vQyxxQkFBcUIsR0FBRztBQUM1Qi9ELFdBQVMsRUFBRSxxQkFEaUI7QUFFNUJDLFlBQVUsRUFBRTtBQUNWaUQsWUFBUSxFQUFFO0FBQUUvQyxpQkFBVyxFQUFFLGlCQUFmO0FBQWtDQyxVQUFJLEVBQUUsUUFBeEM7QUFBa0RDLFdBQUssRUFBRTtBQUF6RCxLQURBO0FBRVZZLFdBQU8sRUFBRTtBQUNQZCxpQkFBVyxFQUFFLDZCQUROO0FBRVBDLFVBQUksRUFBRSxRQUZDO0FBR1BjLFlBQU0sRUFBRSxDQUFDLFFBQUQ7QUFIRCxLQUZDO0FBT1Y4QyxrQkFBYyxFQUFFO0FBQ2Q3RCxpQkFBVyxFQUFFLGdDQURDO0FBRWRDLFVBQUksRUFBRSxPQUZRO0FBR2RnQixXQUFLLEVBQUU7QUFITyxLQVBOO0FBWVY2QyxnQkFBWSxFQUFFO0FBQ1o5RCxpQkFBVyxFQUFFLDhCQUREO0FBRVpDLFVBQUksRUFBRSxPQUZNO0FBR1pnQixXQUFLLEVBQUU7QUFDTGhCLFlBQUksRUFBRSxRQUREO0FBRUxrQixhQUFLLEVBQUU7QUFDTEMsZ0JBQU0sRUFBRTtBQUFFbkIsZ0JBQUksRUFBRSxRQUFSO0FBQWtCQyxpQkFBSyxFQUFFO0FBQXpCLFdBREg7QUFFTGdCLGVBQUssRUFBRTtBQUNMakIsZ0JBQUksRUFBRSxRQUREO0FBRUxELHVCQUFXLEVBQUUsdUNBRlI7QUFHTG1CLGlCQUFLLEVBQUU7QUFDTEUsa0JBQUksRUFBRTtBQUNKckIsMkJBQVcsRUFBRSxhQURUO0FBRUpDLG9CQUFJLEVBQUUsUUFGRjtBQUdKQyxxQkFBSyxFQUFFO0FBSEgsZUFERDtBQU1Mb0IscUJBQU8sRUFBRTtBQUNQdEIsMkJBQVcsRUFBRSxnQkFETjtBQUVQQyxvQkFBSSxFQUFFLFFBRkM7QUFHUEMscUJBQUssRUFBRTtBQUhBLGVBTko7QUFXTHFCLG9CQUFNLEVBQUU7QUFDTnZCLDJCQUFXLEVBQUUsZUFEUDtBQUVOQyxvQkFBSSxFQUFFLFFBRkE7QUFHTnVCLHdCQUFRLEVBQUUsSUFISjtBQUlOdEIscUJBQUssRUFBRTtBQUpEO0FBWEgsYUFIRjtBQXFCTHNCLG9CQUFRLEVBQUU7QUFyQkw7QUFGRjtBQUZGO0FBSEs7QUFaSjtBQUZnQixDQUE5Qjs7Ozs7Ozs7Ozs7OztBQ3RGQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxJQUFNdUMsK0JBQStCLEdBQUc7QUFDdENsRSxXQUFTLEVBQUUsK0JBRDJCO0FBRXRDQyxZQUFVLEVBQUU7QUFDVnNCLFVBQU0sRUFBRTtBQUNOcEIsaUJBQVcsRUFBRSxlQURQO0FBRU5DLFVBQUksRUFBRSxRQUZBO0FBR05DLFdBQUssRUFBRTtBQUhELEtBREU7QUFNVjhELFFBQUksRUFBRTtBQUNKaEUsaUJBQVcsRUFBRSxtQkFEVDtBQUVKQyxVQUFJLEVBQUUsUUFGRjtBQUdKYyxZQUFNLEVBQUUsQ0FBQyxVQUFELEVBQWEsVUFBYixFQUF5QixVQUF6QjtBQUhKLEtBTkk7QUFXVmtELFNBQUssRUFBRTtBQUNMakUsaUJBQVcsRUFBRSxhQURSO0FBRUxDLFVBQUksRUFBRTtBQUZELEtBWEc7QUFlVmlFLGdCQUFZLEVBQUU7QUFDWmxFLGlCQUFXLEVBQUUscUJBREQ7QUFFWkMsVUFBSSxFQUFFLFFBRk07QUFHWmMsWUFBTSxFQUFFLENBQUMsZUFBRDtBQUhJLEtBZko7QUFvQlZaLFlBQVEsRUFBRTtBQUFFSCxpQkFBVyxFQUFFLGdCQUFmO0FBQWlDQyxVQUFJLEVBQUUsUUFBdkM7QUFBaURDLFdBQUssRUFBRTtBQUF4RCxLQXBCQTtBQXFCVkUsU0FBSyxFQUFFO0FBQUVKLGlCQUFXLEVBQUUsZ0JBQWY7QUFBaUNDLFVBQUksRUFBRSxRQUF2QztBQUFpREMsV0FBSyxFQUFFO0FBQXhELEtBckJHO0FBc0JWRyxZQUFRLEVBQUU7QUFBRUwsaUJBQVcsRUFBRSxpQkFBZjtBQUFrQ0MsVUFBSSxFQUFFLFFBQXhDO0FBQWtEQyxXQUFLLEVBQUU7QUFBekQ7QUF0QkE7QUFGMEIsQ0FBeEM7QUEyQkEsSUFBTWlFLDhCQUE4QixHQUFHO0FBQ3JDdEUsV0FBUyxFQUFFLDhCQUQwQjtBQUdyQ0MsWUFBVSxFQUFFO0FBQ1ZzQixVQUFNLEVBQUU7QUFDTnBCLGlCQUFXLEVBQUUsZUFEUDtBQUVOQyxVQUFJLEVBQUUsUUFGQTtBQUdOQyxXQUFLLEVBQUU7QUFIRDtBQURFO0FBSHlCLENBQXZDO0FBV0EsSUFBTWtFLG1DQUFtQyxHQUFHO0FBQzFDdkUsV0FBUyxFQUFFLG1DQUQrQjtBQUcxQ0MsWUFBVSxFQUFFO0FBQ1ZzQixVQUFNLEVBQUU7QUFDTnBCLGlCQUFXLEVBQUUsZUFEUDtBQUVOQyxVQUFJLEVBQUUsUUFGQTtBQUdOQyxXQUFLLEVBQUU7QUFIRCxLQURFO0FBTVZDLFlBQVEsRUFBRTtBQUFFSCxpQkFBVyxFQUFFLGdCQUFmO0FBQWlDQyxVQUFJLEVBQUUsUUFBdkM7QUFBaURDLFdBQUssRUFBRTtBQUF4RCxLQU5BO0FBT1ZFLFNBQUssRUFBRTtBQUFFSixpQkFBVyxFQUFFLGdCQUFmO0FBQWlDQyxVQUFJLEVBQUUsUUFBdkM7QUFBaURDLFdBQUssRUFBRTtBQUF4RCxLQVBHO0FBUVZHLFlBQVEsRUFBRTtBQUFFTCxpQkFBVyxFQUFFLGlCQUFmO0FBQWtDQyxVQUFJLEVBQUUsUUFBeEM7QUFBa0RDLFdBQUssRUFBRTtBQUF6RDtBQVJBO0FBSDhCLENBQTVDO0FBY0EsSUFBTW1FLHFDQUFxQyxHQUFHO0FBQzVDeEUsV0FBUyxFQUFFLG9DQURpQztBQUc1Q0MsWUFBVSxFQUFFO0FBQ1ZzQixVQUFNLEVBQUU7QUFDTnBCLGlCQUFXLEVBQUUsZUFEUDtBQUVOQyxVQUFJLEVBQUUsUUFGQTtBQUdOQyxXQUFLLEVBQUU7QUFIRCxLQURFO0FBTVZDLFlBQVEsRUFBRTtBQUFFSCxpQkFBVyxFQUFFLGdCQUFmO0FBQWlDQyxVQUFJLEVBQUUsUUFBdkM7QUFBaURDLFdBQUssRUFBRTtBQUF4RCxLQU5BO0FBT1ZFLFNBQUssRUFBRTtBQUFFSixpQkFBVyxFQUFFLGdCQUFmO0FBQWlDQyxVQUFJLEVBQUUsUUFBdkM7QUFBaURDLFdBQUssRUFBRTtBQUF4RCxLQVBHO0FBUVZHLFlBQVEsRUFBRTtBQUFFTCxpQkFBVyxFQUFFLGlCQUFmO0FBQWtDQyxVQUFJLEVBQUUsUUFBeEM7QUFBa0RDLFdBQUssRUFBRTtBQUF6RDtBQVJBO0FBSGdDLENBQTlDO0FBY0EsSUFBTW9FLGlDQUFpQyxHQUFHO0FBQ3hDekUsV0FBUyxFQUFFLGlDQUQ2QjtBQUd4Q0MsWUFBVSxFQUFFO0FBQ1ZzQixVQUFNLEVBQUU7QUFDTnBCLGlCQUFXLEVBQUUsZUFEUDtBQUVOQyxVQUFJLEVBQUUsUUFGQTtBQUdOQyxXQUFLLEVBQUU7QUFIRCxLQURFO0FBTVZxRSxVQUFNLEVBQUU7QUFDTnZFLGlCQUFXLEVBQUUsNkJBRFA7QUFFTkMsVUFBSSxFQUFFLFFBRkE7QUFHTkMsV0FBSyxFQUFFO0FBSEQsS0FORTtBQVdWc0UsZ0JBQVksRUFBRTtBQUNaeEUsaUJBQVcsRUFBRSw4QkFERDtBQUVaQyxVQUFJLEVBQUUsUUFGTTtBQUdaQyxXQUFLLEVBQUU7QUFISyxLQVhKO0FBZ0JWZ0IsU0FBSyxFQUFFO0FBQ0xqQixVQUFJLEVBQUUsUUFERDtBQUVMRCxpQkFBVyxFQUFFLHVDQUZSO0FBR0xtQixXQUFLLEVBQUU7QUFDTEUsWUFBSSxFQUFFO0FBQ0pyQixxQkFBVyxFQUFFLGFBRFQ7QUFFSkMsY0FBSSxFQUFFLFFBRkY7QUFHSkMsZUFBSyxFQUFFO0FBSEgsU0FERDtBQU1Mb0IsZUFBTyxFQUFFO0FBQ1B0QixxQkFBVyxFQUFFLGdCQUROO0FBRVBDLGNBQUksRUFBRSxRQUZDO0FBR1BDLGVBQUssRUFBRTtBQUhBLFNBTko7QUFXTHFCLGNBQU0sRUFBRTtBQUNOdkIscUJBQVcsRUFBRSxlQURQO0FBRU5DLGNBQUksRUFBRSxRQUZBO0FBR051QixrQkFBUSxFQUFFLElBSEo7QUFJTnRCLGVBQUssRUFBRTtBQUpEO0FBWEgsT0FIRjtBQXFCTHNCLGNBQVEsRUFBRTtBQXJCTDtBQWhCRztBQUg0QixDQUExQztBQTRDQSxJQUFNaUQsaUNBQWlDLEdBQUc7QUFDeEM1RSxXQUFTLEVBQUUsaUNBRDZCO0FBR3hDQyxZQUFVLEVBQUU7QUFDVnNCLFVBQU0sRUFBRTtBQUNOcEIsaUJBQVcsRUFBRSxnQ0FEUDtBQUVOQyxVQUFJLEVBQUUsUUFGQTtBQUdOQyxXQUFLLEVBQUU7QUFIRCxLQURFO0FBTVZnQixTQUFLLEVBQUU7QUFDTGpCLFVBQUksRUFBRSxRQUREO0FBRUxELGlCQUFXLEVBQUUsdUNBRlI7QUFHTG1CLFdBQUssRUFBRTtBQUNMRSxZQUFJLEVBQUU7QUFDSnJCLHFCQUFXLEVBQUUsYUFEVDtBQUVKQyxjQUFJLEVBQUUsUUFGRjtBQUdKQyxlQUFLLEVBQUU7QUFISCxTQUREO0FBTUxvQixlQUFPLEVBQUU7QUFDUHRCLHFCQUFXLEVBQUUsZ0JBRE47QUFFUEMsY0FBSSxFQUFFLFFBRkM7QUFHUEMsZUFBSyxFQUFFO0FBSEEsU0FOSjtBQVdMcUIsY0FBTSxFQUFFO0FBQ052QixxQkFBVyxFQUFFLGVBRFA7QUFFTkMsY0FBSSxFQUFFLFFBRkE7QUFHTnVCLGtCQUFRLEVBQUUsSUFISjtBQUlOdEIsZUFBSyxFQUFFO0FBSkQ7QUFYSCxPQUhGO0FBcUJMc0IsY0FBUSxFQUFFO0FBckJMO0FBTkc7QUFINEIsQ0FBMUM7QUFrQ0EsSUFBTWtELG9DQUFvQyxHQUFHO0FBQzNDN0UsV0FBUyxFQUFFLG9DQURnQztBQUczQ0MsWUFBVSxFQUFFO0FBQ1ZzQixVQUFNLEVBQUU7QUFDTnBCLGlCQUFXLEVBQUUsZ0NBRFA7QUFFTkMsVUFBSSxFQUFFLFFBRkE7QUFHTkMsV0FBSyxFQUFFO0FBSEQsS0FERTtBQU1WZ0IsU0FBSyxFQUFFO0FBQ0xqQixVQUFJLEVBQUUsUUFERDtBQUVMRCxpQkFBVyxFQUFFLHVDQUZSO0FBR0xtQixXQUFLLEVBQUU7QUFDTEUsWUFBSSxFQUFFO0FBQ0pyQixxQkFBVyxFQUFFLGFBRFQ7QUFFSkMsY0FBSSxFQUFFLFFBRkY7QUFHSkMsZUFBSyxFQUFFO0FBSEgsU0FERDtBQU1Mb0IsZUFBTyxFQUFFO0FBQ1B0QixxQkFBVyxFQUFFLGdCQUROO0FBRVBDLGNBQUksRUFBRSxRQUZDO0FBR1BDLGVBQUssRUFBRTtBQUhBLFNBTko7QUFXTHFCLGNBQU0sRUFBRTtBQUNOdkIscUJBQVcsRUFBRSxlQURQO0FBRU5DLGNBQUksRUFBRSxRQUZBO0FBR051QixrQkFBUSxFQUFFLElBSEo7QUFJTnRCLGVBQUssRUFBRTtBQUpEO0FBWEgsT0FIRjtBQXFCTHNCLGNBQVEsRUFBRTtBQXJCTDtBQU5HO0FBSCtCLENBQTdDO0FBa0NBLElBQU1tRCxzQ0FBc0MsR0FBRztBQUM3QzlFLFdBQVMsRUFBRSxzQ0FEa0M7QUFHN0NDLFlBQVUsRUFBRTtBQUNWc0IsVUFBTSxFQUFFO0FBQ05wQixpQkFBVyxFQUFFLGVBRFA7QUFFTkMsVUFBSSxFQUFFLFFBRkE7QUFHTkMsV0FBSyxFQUFFO0FBSEQsS0FERTtBQU1WZ0IsU0FBSyxFQUFFO0FBQ0xqQixVQUFJLEVBQUUsUUFERDtBQUVMRCxpQkFBVyxFQUFFLHVDQUZSO0FBR0xtQixXQUFLLEVBQUU7QUFDTEUsWUFBSSxFQUFFO0FBQ0pyQixxQkFBVyxFQUFFLGFBRFQ7QUFFSkMsY0FBSSxFQUFFLFFBRkY7QUFHSkMsZUFBSyxFQUFFO0FBSEgsU0FERDtBQU1Mb0IsZUFBTyxFQUFFO0FBQ1B0QixxQkFBVyxFQUFFLGdCQUROO0FBRVBDLGNBQUksRUFBRSxRQUZDO0FBR1BDLGVBQUssRUFBRTtBQUhBLFNBTko7QUFXTHFCLGNBQU0sRUFBRTtBQUNOdkIscUJBQVcsRUFBRSxlQURQO0FBRU5DLGNBQUksRUFBRSxRQUZBO0FBR051QixrQkFBUSxFQUFFLElBSEo7QUFJTnRCLGVBQUssRUFBRTtBQUpEO0FBWEgsT0FIRjtBQXFCTHNCLGNBQVEsRUFBRTtBQXJCTDtBQU5HO0FBSGlDLENBQS9DO0FBbUNBLElBQU1vRCwrQkFBK0IsR0FBRztBQUN0Qy9FLFdBQVMsRUFBRSwrQkFEMkI7QUFHdENDLFlBQVUsRUFBRTtBQUNWc0IsVUFBTSxFQUFFO0FBQ05wQixpQkFBVyxFQUFFLGVBRFA7QUFFTkMsVUFBSSxFQUFFLFFBRkE7QUFHTkMsV0FBSyxFQUFFO0FBSEQsS0FERTtBQU1WOEQsUUFBSSxFQUFFO0FBQ0poRSxpQkFBVyxFQUFFLG1CQURUO0FBRUpDLFVBQUksRUFBRSxRQUZGO0FBR0pjLFlBQU0sRUFBRSxDQUFDLFVBQUQsRUFBYSxVQUFiLEVBQXlCLFVBQXpCO0FBSEosS0FOSTtBQVdWa0QsU0FBSyxFQUFFO0FBQ0xqRSxpQkFBVyxFQUFFLGFBRFI7QUFFTEMsVUFBSSxFQUFFO0FBRkQsS0FYRztBQWVWaUUsZ0JBQVksRUFBRTtBQUNabEUsaUJBQVcsRUFBRSxxQkFERDtBQUVaQyxVQUFJLEVBQUUsUUFGTTtBQUdaYyxZQUFNLEVBQUUsQ0FBQyxlQUFELEVBQWtCLE1BQWxCO0FBSEksS0FmSjtBQW9CVlosWUFBUSxFQUFFO0FBQUVILGlCQUFXLEVBQUUsZ0JBQWY7QUFBaUNDLFVBQUksRUFBRSxRQUF2QztBQUFpREMsV0FBSyxFQUFFO0FBQXhELEtBcEJBO0FBcUJWRSxTQUFLLEVBQUU7QUFBRUosaUJBQVcsRUFBRSxnQkFBZjtBQUFpQ0MsVUFBSSxFQUFFLFFBQXZDO0FBQWlEQyxXQUFLLEVBQUU7QUFBeEQsS0FyQkc7QUFzQlZHLFlBQVEsRUFBRTtBQUFFTCxpQkFBVyxFQUFFLGlCQUFmO0FBQWtDQyxVQUFJLEVBQUUsUUFBeEM7QUFBa0RDLFdBQUssRUFBRTtBQUF6RCxLQXRCQTtBQXVCVjJFLGNBQVUsRUFBRTtBQUNWN0UsaUJBQVcsRUFBRSxnQ0FESDtBQUVWQyxVQUFJLEVBQUUsT0FGSTtBQUdWZ0IsV0FBSyxFQUFFO0FBSEcsS0F2QkY7QUE0QlY2RCxTQUFLLEVBQUU7QUFDTDlFLGlCQUFXLEVBQUUsaUJBRFI7QUFFTEMsVUFBSSxFQUFFLFFBRkQ7QUFHTHVCLGNBQVEsRUFBRSxJQUhMO0FBSUx0QixXQUFLLEVBQUU7QUFKRjtBQTVCRztBQUgwQixDQUF4QztBQXVDQSxJQUFNNkUsOEJBQThCLEdBQUc7QUFDckNsRixXQUFTLEVBQUUsOEJBRDBCO0FBRXJDaUMsU0FBTyxFQUFFLGdEQUY0QjtBQUdyQ2hDLFlBQVUsRUFBRTtBQUNWc0IsVUFBTSxFQUFFO0FBQ05wQixpQkFBVyxFQUFFLGVBRFA7QUFFTkMsVUFBSSxFQUFFLFFBRkE7QUFHTkMsV0FBSyxFQUFFO0FBSEQsS0FERTtBQU1WcUUsVUFBTSxFQUFFO0FBQ052RSxpQkFBVyxFQUFFLDZCQURQO0FBRU5DLFVBQUksRUFBRSxRQUZBO0FBR05DLFdBQUssRUFBRTtBQUhELEtBTkU7QUFXVnNFLGdCQUFZLEVBQUU7QUFDWnhFLGlCQUFXLEVBQUUsOEJBREQ7QUFFWkMsVUFBSSxFQUFFLFFBRk07QUFHWkMsV0FBSyxFQUFFO0FBSEs7QUFYSjtBQUh5QixDQUF2QztBQXFCQSxJQUFNOEUsZ0NBQWdDLEdBQUc7QUFDdkNuRixXQUFTLEVBQUUsZ0NBRDRCO0FBR3ZDQyxZQUFVLEVBQUU7QUFDVnNCLFVBQU0sRUFBRTtBQUNOcEIsaUJBQVcsRUFBRSxlQURQO0FBRU5DLFVBQUksRUFBRSxRQUZBO0FBR05DLFdBQUssRUFBRTtBQUhELEtBREU7QUFNVnFFLFVBQU0sRUFBRTtBQUNOdkUsaUJBQVcsRUFBRSw2QkFEUDtBQUVOQyxVQUFJLEVBQUUsUUFGQTtBQUdOQyxXQUFLLEVBQUU7QUFIRCxLQU5FO0FBV1ZzRSxnQkFBWSxFQUFFO0FBQ1p4RSxpQkFBVyxFQUFFLDhCQUREO0FBRVpDLFVBQUksRUFBRSxRQUZNO0FBR1pDLFdBQUssRUFBRTtBQUhLLEtBWEo7QUFnQlYrRCxTQUFLLEVBQUU7QUFDTGpFLGlCQUFXLEVBQUUsYUFEUjtBQUVMQyxVQUFJLEVBQUU7QUFGRCxLQWhCRztBQW9CVjRFLGNBQVUsRUFBRTtBQUNWN0UsaUJBQVcsRUFBRSxnQ0FESDtBQUVWQyxVQUFJLEVBQUUsT0FGSTtBQUdWZ0IsV0FBSyxFQUFFO0FBSEcsS0FwQkY7QUF5QlY2RCxTQUFLLEVBQUU7QUFDTDlFLGlCQUFXLEVBQUUsaUJBRFI7QUFFTEMsVUFBSSxFQUFFLFFBRkQ7QUFHTHVCLGNBQVEsRUFBRSxJQUhMO0FBSUx0QixXQUFLLEVBQUU7QUFKRjtBQXpCRztBQUgyQixDQUF6QztBQW9DQSxJQUFNK0UsaUNBQWlDLEdBQUc7QUFDeENwRixXQUFTLEVBQUUsaUNBRDZCO0FBR3hDQyxZQUFVLEVBQUU7QUFDVnNCLFVBQU0sRUFBRTtBQUNOcEIsaUJBQVcsRUFBRSxlQURQO0FBRU5DLFVBQUksRUFBRSxRQUZBO0FBR05DLFdBQUssRUFBRTtBQUhELEtBREU7QUFNVnFFLFVBQU0sRUFBRTtBQUNOdkUsaUJBQVcsRUFBRSw2QkFEUDtBQUVOQyxVQUFJLEVBQUUsUUFGQTtBQUdOQyxXQUFLLEVBQUU7QUFIRCxLQU5FO0FBV1ZzRSxnQkFBWSxFQUFFO0FBQ1p4RSxpQkFBVyxFQUFFLDhCQUREO0FBRVpDLFVBQUksRUFBRSxRQUZNO0FBR1pDLFdBQUssRUFBRTtBQUhLLEtBWEo7QUFnQlZnQixTQUFLLEVBQUU7QUFDTGpCLFVBQUksRUFBRSxRQUREO0FBRUxELGlCQUFXLEVBQUUsdUNBRlI7QUFHTG1CLFdBQUssRUFBRTtBQUNMRSxZQUFJLEVBQUU7QUFDSnJCLHFCQUFXLEVBQUUsYUFEVDtBQUVKQyxjQUFJLEVBQUUsUUFGRjtBQUdKQyxlQUFLLEVBQUU7QUFISCxTQUREO0FBTUxvQixlQUFPLEVBQUU7QUFDUHRCLHFCQUFXLEVBQUUsZ0JBRE47QUFFUEMsY0FBSSxFQUFFLFFBRkM7QUFHUEMsZUFBSyxFQUFFO0FBSEEsU0FOSjtBQVdMcUIsY0FBTSxFQUFFO0FBQ052QixxQkFBVyxFQUFFLGVBRFA7QUFFTkMsY0FBSSxFQUFFLFFBRkE7QUFHTnVCLGtCQUFRLEVBQUUsSUFISjtBQUlOdEIsZUFBSyxFQUFFO0FBSkQ7QUFYSCxPQUhGO0FBcUJMc0IsY0FBUSxFQUFFO0FBckJMO0FBaEJHO0FBSDRCLENBQTFDO0FBNENBLElBQU0wRCxpQ0FBaUMsR0FBRztBQUN4Q3JGLFdBQVMsRUFBRSxpQ0FENkI7QUFHeENDLFlBQVUsRUFBRTtBQUNWc0IsVUFBTSxFQUFFO0FBQ05wQixpQkFBVyxFQUFFLGVBRFA7QUFFTkMsVUFBSSxFQUFFLFFBRkE7QUFHTkMsV0FBSyxFQUFFO0FBSEQsS0FERTtBQU1WZ0IsU0FBSyxFQUFFO0FBQ0xqQixVQUFJLEVBQUUsUUFERDtBQUVMRCxpQkFBVyxFQUFFLHVDQUZSO0FBR0xtQixXQUFLLEVBQUU7QUFDTEUsWUFBSSxFQUFFO0FBQ0pyQixxQkFBVyxFQUFFLGFBRFQ7QUFFSkMsY0FBSSxFQUFFLFFBRkY7QUFHSkMsZUFBSyxFQUFFO0FBSEgsU0FERDtBQU1Mb0IsZUFBTyxFQUFFO0FBQ1B0QixxQkFBVyxFQUFFLGdCQUROO0FBRVBDLGNBQUksRUFBRSxRQUZDO0FBR1BDLGVBQUssRUFBRTtBQUhBLFNBTko7QUFXTHFCLGNBQU0sRUFBRTtBQUNOdkIscUJBQVcsRUFBRSxlQURQO0FBRU5DLGNBQUksRUFBRSxRQUZBO0FBR051QixrQkFBUSxFQUFFLElBSEo7QUFJTnRCLGVBQUssRUFBRTtBQUpEO0FBWEgsT0FIRjtBQXFCTHNCLGNBQVEsRUFBRTtBQXJCTDtBQU5HO0FBSDRCLENBQTFDO0FBa0NBLElBQU0yRCxpQ0FBaUMsR0FBRztBQUN4Q3RGLFdBQVMsRUFBRSxpQ0FENkI7QUFHeENDLFlBQVUsRUFBRTtBQUNWc0IsVUFBTSxFQUFFO0FBQ05wQixpQkFBVyxFQUFFLGVBRFA7QUFFTkMsVUFBSSxFQUFFLFFBRkE7QUFHTkMsV0FBSyxFQUFFO0FBSEQsS0FERTtBQU1WZ0IsU0FBSyxFQUFFO0FBQ0xqQixVQUFJLEVBQUUsUUFERDtBQUVMRCxpQkFBVyxFQUFFLHVDQUZSO0FBR0xtQixXQUFLLEVBQUU7QUFDTEUsWUFBSSxFQUFFO0FBQ0pyQixxQkFBVyxFQUFFLGFBRFQ7QUFFSkMsY0FBSSxFQUFFLFFBRkY7QUFHSkMsZUFBSyxFQUFFO0FBSEgsU0FERDtBQU1Mb0IsZUFBTyxFQUFFO0FBQ1B0QixxQkFBVyxFQUFFLGdCQUROO0FBRVBDLGNBQUksRUFBRSxRQUZDO0FBR1BDLGVBQUssRUFBRTtBQUhBLFNBTko7QUFXTHFCLGNBQU0sRUFBRTtBQUNOdkIscUJBQVcsRUFBRSxlQURQO0FBRU5DLGNBQUksRUFBRSxRQUZBO0FBR051QixrQkFBUSxFQUFFLElBSEo7QUFJTnRCLGVBQUssRUFBRTtBQUpEO0FBWEgsT0FIRjtBQXFCTHNCLGNBQVEsRUFBRTtBQXJCTDtBQU5HO0FBSDRCLENBQTFDO0FBa0NBLElBQU00RCx5QkFBeUIsR0FBRztBQUNoQ3ZGLFdBQVMsRUFBRSx5QkFEcUI7QUFHaENDLFlBQVUsRUFBRTtBQUNWc0IsVUFBTSxFQUFFO0FBQ05wQixpQkFBVyxFQUFFLGVBRFA7QUFFTkMsVUFBSSxFQUFFLFFBRkE7QUFHTkMsV0FBSyxFQUFFO0FBSEQsS0FERTtBQU1WOEMsV0FBTyxFQUFFO0FBQ1BoRCxpQkFBVyxFQUFFLGdCQUROO0FBRVBDLFVBQUksRUFBRSxRQUZDO0FBR1BDLFdBQUssRUFBRTtBQUhBLEtBTkM7QUFXVjhELFFBQUksRUFBRTtBQUNKaEUsaUJBQVcsRUFBRSxtQkFEVDtBQUVKQyxVQUFJLEVBQUUsUUFGRjtBQUdKYyxZQUFNLEVBQUUsQ0FBQyxVQUFELEVBQWEsVUFBYixFQUF5QixVQUF6QjtBQUhKLEtBWEk7QUFnQlZrRCxTQUFLLEVBQUU7QUFDTGpFLGlCQUFXLEVBQUUsYUFEUjtBQUVMQyxVQUFJLEVBQUUsU0FGRDtBQUdMQyxXQUFLLEVBQUU7QUFIRixLQWhCRztBQXFCVm1GLFlBQVEsRUFBRTtBQUNSckYsaUJBQVcsRUFBRSxxQkFETDtBQUVSQyxVQUFJLEVBQUUsUUFGRTtBQUdSQyxXQUFLLEVBQUU7QUFIQyxLQXJCQTtBQTBCVkMsWUFBUSxFQUFFO0FBQUVILGlCQUFXLEVBQUUsZ0JBQWY7QUFBaUNDLFVBQUksRUFBRSxRQUF2QztBQUFpREMsV0FBSyxFQUFFO0FBQXhELEtBMUJBO0FBMkJWRSxTQUFLLEVBQUU7QUFBRUosaUJBQVcsRUFBRSxnQkFBZjtBQUFpQ0MsVUFBSSxFQUFFLFFBQXZDO0FBQWlEQyxXQUFLLEVBQUU7QUFBeEQsS0EzQkc7QUE0QlZHLFlBQVEsRUFBRTtBQUFFTCxpQkFBVyxFQUFFLGlCQUFmO0FBQWtDQyxVQUFJLEVBQUUsUUFBeEM7QUFBa0RDLFdBQUssRUFBRTtBQUF6RCxLQTVCQTtBQTZCVkksYUFBUyxFQUFFO0FBQ1ROLGlCQUFXLEVBQUUsdUJBREo7QUFFVEMsVUFBSSxFQUFFO0FBRkcsS0E3QkQ7QUFpQ1Z5RCxZQUFRLEVBQUU7QUFDUjFELGlCQUFXLEVBQUUscUJBREw7QUFFUkMsVUFBSSxFQUFFO0FBRkU7QUFqQ0E7QUFIb0IsQ0FBbEM7QUEwQ0EsSUFBTXFGLHdCQUF3QixHQUFHO0FBQy9CekYsV0FBUyxFQUFFLHdCQURvQjtBQUcvQkMsWUFBVSxFQUFFO0FBQ1ZzQixVQUFNLEVBQUU7QUFDTnBCLGlCQUFXLEVBQUUsZUFEUDtBQUVOQyxVQUFJLEVBQUUsUUFGQTtBQUdOQyxXQUFLLEVBQUU7QUFIRCxLQURFO0FBTVZxRSxVQUFNLEVBQUU7QUFDTnZFLGlCQUFXLEVBQUUsNkJBRFA7QUFFTkMsVUFBSSxFQUFFLFFBRkE7QUFHTkMsV0FBSyxFQUFFO0FBSEQsS0FORTtBQVdWc0UsZ0JBQVksRUFBRTtBQUNaeEUsaUJBQVcsRUFBRSw4QkFERDtBQUVaQyxVQUFJLEVBQUUsUUFGTTtBQUdaQyxXQUFLLEVBQUU7QUFISztBQVhKO0FBSG1CLENBQWpDO0FBcUJBLElBQU1xRiwwQkFBMEIsR0FBRztBQUNqQzFGLFdBQVMsRUFBRSwwQkFEc0I7QUFHakNDLFlBQVUsRUFBRTtBQUNWc0IsVUFBTSxFQUFFO0FBQ05wQixpQkFBVyxFQUFFLGVBRFA7QUFFTkMsVUFBSSxFQUFFLFFBRkE7QUFHTkMsV0FBSyxFQUFFO0FBSEQsS0FERTtBQU1WcUUsVUFBTSxFQUFFO0FBQ052RSxpQkFBVyxFQUFFLDZCQURQO0FBRU5DLFVBQUksRUFBRSxRQUZBO0FBR05DLFdBQUssRUFBRTtBQUhELEtBTkU7QUFXVnNFLGdCQUFZLEVBQUU7QUFDWnhFLGlCQUFXLEVBQUUsOEJBREQ7QUFFWkMsVUFBSSxFQUFFLFFBRk07QUFHWkMsV0FBSyxFQUFFO0FBSEssS0FYSjtBQWdCVitELFNBQUssRUFBRTtBQUNMakUsaUJBQVcsRUFBRSxhQURSO0FBRUxDLFVBQUksRUFBRTtBQUZELEtBaEJHO0FBb0JWeUQsWUFBUSxFQUFFO0FBQ1IxRCxpQkFBVyxFQUFFLHFCQURMO0FBRVJDLFVBQUksRUFBRTtBQUZFO0FBcEJBO0FBSHFCLENBQW5DO0FBNkJBLElBQU11RiwyQkFBMkIsR0FBRztBQUNsQzNGLFdBQVMsRUFBRSwyQkFEdUI7QUFHbENDLFlBQVUsRUFBRTtBQUNWc0IsVUFBTSxFQUFFO0FBQ05wQixpQkFBVyxFQUFFLGVBRFA7QUFFTkMsVUFBSSxFQUFFLFFBRkE7QUFHTkMsV0FBSyxFQUFFO0FBSEQsS0FERTtBQU1WcUUsVUFBTSxFQUFFO0FBQ052RSxpQkFBVyxFQUFFLDZCQURQO0FBRU5DLFVBQUksRUFBRSxRQUZBO0FBR05DLFdBQUssRUFBRTtBQUhELEtBTkU7QUFXVnNFLGdCQUFZLEVBQUU7QUFDWnhFLGlCQUFXLEVBQUUsOEJBREQ7QUFFWkMsVUFBSSxFQUFFLFFBRk07QUFHWkMsV0FBSyxFQUFFO0FBSEssS0FYSjtBQWdCVmdCLFNBQUssRUFBRTtBQUNMakIsVUFBSSxFQUFFLFFBREQ7QUFFTEQsaUJBQVcsRUFBRSx1Q0FGUjtBQUdMbUIsV0FBSyxFQUFFO0FBQ0xFLFlBQUksRUFBRTtBQUNKckIscUJBQVcsRUFBRSxhQURUO0FBRUpDLGNBQUksRUFBRTtBQUZGLFNBREQ7QUFLTHFCLGVBQU8sRUFBRTtBQUNQdEIscUJBQVcsRUFBRSxnQkFETjtBQUVQQyxjQUFJLEVBQUU7QUFGQyxTQUxKO0FBU0xzQixjQUFNLEVBQUU7QUFDTnZCLHFCQUFXLEVBQUUsZUFEUDtBQUVOQyxjQUFJLEVBQUUsUUFGQTtBQUdOdUIsa0JBQVEsRUFBRSxJQUhKO0FBSU50QixlQUFLLEVBQUU7QUFKRDtBQVRILE9BSEY7QUFtQkxzQixjQUFRLEVBQUU7QUFuQkw7QUFoQkc7QUFIc0IsQ0FBcEM7QUEwQ0EsSUFBTWlFLDJCQUEyQixHQUFHO0FBQ2xDNUYsV0FBUyxFQUFFLDJCQUR1QjtBQUdsQ0MsWUFBVSxFQUFFO0FBQ1ZzQixVQUFNLEVBQUU7QUFDTnBCLGlCQUFXLEVBQUUsZUFEUDtBQUVOQyxVQUFJLEVBQUUsUUFGQTtBQUdOQyxXQUFLLEVBQUU7QUFIRCxLQURFO0FBTVZnQixTQUFLLEVBQUU7QUFDTGpCLFVBQUksRUFBRSxRQUREO0FBRUxELGlCQUFXLEVBQUUsdUNBRlI7QUFHTG1CLFdBQUssRUFBRTtBQUNMRSxZQUFJLEVBQUU7QUFDSnJCLHFCQUFXLEVBQUUsYUFEVDtBQUVKQyxjQUFJLEVBQUUsUUFGRjtBQUdKQyxlQUFLLEVBQUU7QUFISCxTQUREO0FBTUxvQixlQUFPLEVBQUU7QUFDUHRCLHFCQUFXLEVBQUUsZ0JBRE47QUFFUEMsY0FBSSxFQUFFLFFBRkM7QUFHUEMsZUFBSyxFQUFFO0FBSEEsU0FOSjtBQVdMcUIsY0FBTSxFQUFFO0FBQ052QixxQkFBVyxFQUFFLGVBRFA7QUFFTkMsY0FBSSxFQUFFLFFBRkE7QUFHTnVCLGtCQUFRLEVBQUUsSUFISjtBQUlOdEIsZUFBSyxFQUFFO0FBSkQ7QUFYSCxPQUhGO0FBcUJMc0IsY0FBUSxFQUFFO0FBckJMO0FBTkc7QUFIc0IsQ0FBcEM7QUFrQ0EsSUFBTWtFLDJCQUEyQixHQUFHO0FBQ2xDN0YsV0FBUyxFQUFFLDJCQUR1QjtBQUdsQ0MsWUFBVSxFQUFFO0FBQ1ZzQixVQUFNLEVBQUU7QUFDTnBCLGlCQUFXLEVBQUUsZUFEUDtBQUVOQyxVQUFJLEVBQUUsUUFGQTtBQUdOQyxXQUFLLEVBQUU7QUFIRCxLQURFO0FBTVZnQixTQUFLLEVBQUU7QUFDTGpCLFVBQUksRUFBRSxRQUREO0FBRUxELGlCQUFXLEVBQUUsdUNBRlI7QUFHTG1CLFdBQUssRUFBRTtBQUNMRSxZQUFJLEVBQUU7QUFDSnJCLHFCQUFXLEVBQUUsYUFEVDtBQUVKQyxjQUFJLEVBQUUsUUFGRjtBQUdKQyxlQUFLLEVBQUU7QUFISCxTQUREO0FBTUxvQixlQUFPLEVBQUU7QUFDUHRCLHFCQUFXLEVBQUUsZ0JBRE47QUFFUEMsY0FBSSxFQUFFLFFBRkM7QUFHUEMsZUFBSyxFQUFFO0FBSEEsU0FOSjtBQVdMcUIsY0FBTSxFQUFFO0FBQ052QixxQkFBVyxFQUFFLGVBRFA7QUFFTkMsY0FBSSxFQUFFLFFBRkE7QUFHTnVCLGtCQUFRLEVBQUUsSUFISjtBQUlOdEIsZUFBSyxFQUFFO0FBSkQ7QUFYSCxPQUhGO0FBcUJMc0IsY0FBUSxFQUFFO0FBckJMO0FBTkc7QUFIc0IsQ0FBcEM7QUFrQ0EsSUFBTW1FLHdCQUF3QixHQUFHO0FBQy9COUYsV0FBUyxFQUFFLHdCQURvQjtBQUcvQkMsWUFBVSxFQUFFO0FBQ1ZzQixVQUFNLEVBQUU7QUFDTnBCLGlCQUFXLEVBQUUsZUFEUDtBQUVOQyxVQUFJLEVBQUUsUUFGQTtBQUdOQyxXQUFLLEVBQUU7QUFIRCxLQURFO0FBTVY4RCxRQUFJLEVBQUU7QUFDSmhFLGlCQUFXLEVBQUUsbUJBRFQ7QUFFSkMsVUFBSSxFQUFFLFFBRkY7QUFHSmMsWUFBTSxFQUFFLENBQUMsVUFBRCxFQUFhLFVBQWIsRUFBeUIsVUFBekI7QUFISixLQU5JO0FBV1ZrRCxTQUFLLEVBQUU7QUFDTGpFLGlCQUFXLEVBQUUsYUFEUjtBQUVMQyxVQUFJLEVBQUU7QUFGRCxLQVhHO0FBZVZFLFlBQVEsRUFBRTtBQUFFSCxpQkFBVyxFQUFFLGdCQUFmO0FBQWlDQyxVQUFJLEVBQUUsUUFBdkM7QUFBaURDLFdBQUssRUFBRTtBQUF4RCxLQWZBO0FBZ0JWRSxTQUFLLEVBQUU7QUFBRUosaUJBQVcsRUFBRSxnQkFBZjtBQUFpQ0MsVUFBSSxFQUFFLFFBQXZDO0FBQWlEQyxXQUFLLEVBQUU7QUFBeEQsS0FoQkc7QUFpQlZHLFlBQVEsRUFBRTtBQUFFTCxpQkFBVyxFQUFFLGlCQUFmO0FBQWtDQyxVQUFJLEVBQUUsUUFBeEM7QUFBa0RDLFdBQUssRUFBRTtBQUF6RCxLQWpCQTtBQWtCVkksYUFBUyxFQUFFO0FBQ1ROLGlCQUFXLEVBQUUsdUJBREo7QUFFVEMsVUFBSSxFQUFFO0FBRkcsS0FsQkQ7QUFzQlYrQyxXQUFPLEVBQUU7QUFDUGhELGlCQUFXLEVBQUUsZ0NBRE47QUFFUEMsVUFBSSxFQUFFLFFBRkM7QUFHUEMsV0FBSyxFQUFFO0FBSEEsS0F0QkM7QUEyQlYwRixVQUFNLEVBQUU7QUFDTjVGLGlCQUFXLEVBQUUsZUFEUDtBQUVOQyxVQUFJLEVBQUUsUUFGQTtBQUdOQyxXQUFLLEVBQUU7QUFIRCxLQTNCRTtBQWdDVndELFlBQVEsRUFBRTtBQUNSMUQsaUJBQVcsRUFBRSxvQkFETDtBQUVSQyxVQUFJLEVBQUUsUUFGRTtBQUdSa0IsV0FBSyxFQUFFO0FBQ0x3QyxvQkFBWSxFQUFFO0FBQ1ozRCxxQkFBVyxFQUFFLHNCQUREO0FBRVpDLGNBQUksRUFBRTtBQUZNLFNBRFQ7QUFLTFcsY0FBTSxFQUFFO0FBQ05aLHFCQUFXLEVBQUUsbUJBRFA7QUFFTkMsY0FBSSxFQUFFO0FBRkE7QUFMSCxPQUhDO0FBYVJ1QixjQUFRLEVBQUU7QUFiRjtBQWhDQTtBQUhtQixDQUFqQztBQW9EQSxJQUFNcUUsdUJBQXVCLEdBQUc7QUFDOUJoRyxXQUFTLEVBQUUsdUJBRG1CO0FBRzlCQyxZQUFVLEVBQUU7QUFDVnNCLFVBQU0sRUFBRTtBQUNOcEIsaUJBQVcsRUFBRSxlQURQO0FBRU5DLFVBQUksRUFBRSxRQUZBO0FBR05DLFdBQUssRUFBRTtBQUhELEtBREU7QUFNVjhDLFdBQU8sRUFBRTtBQUNQaEQsaUJBQVcsRUFBRSxXQUROO0FBRVBDLFVBQUksRUFBRSxRQUZDO0FBR1BDLFdBQUssRUFBRTtBQUhBO0FBTkM7QUFIa0IsQ0FBaEM7QUFnQkEsSUFBTTRGLHlCQUF5QixHQUFHO0FBQ2hDakcsV0FBUyxFQUFFLHlCQURxQjtBQUdoQ0MsWUFBVSxFQUFFO0FBQ1ZzQixVQUFNLEVBQUU7QUFDTnBCLGlCQUFXLEVBQUUsZUFEUDtBQUVOQyxVQUFJLEVBQUUsUUFGQTtBQUdOQyxXQUFLLEVBQUU7QUFIRCxLQURFO0FBTVYrRCxTQUFLLEVBQUU7QUFDTGpFLGlCQUFXLEVBQUUsYUFEUjtBQUVMQyxVQUFJLEVBQUU7QUFGRCxLQU5HO0FBVVZ5RCxZQUFRLEVBQUU7QUFDUjFELGlCQUFXLEVBQUUsb0JBREw7QUFFUkMsVUFBSSxFQUFFLFFBRkU7QUFHUmtCLFdBQUssRUFBRTtBQUNMd0Msb0JBQVksRUFBRTtBQUNaM0QscUJBQVcsRUFBRSxzQkFERDtBQUVaQyxjQUFJLEVBQUU7QUFGTSxTQURUO0FBS0xXLGNBQU0sRUFBRTtBQUNOWixxQkFBVyxFQUFFLG1CQURQO0FBRU5DLGNBQUksRUFBRTtBQUZBO0FBTEgsT0FIQztBQWFSdUIsY0FBUSxFQUFFO0FBYkY7QUFWQTtBQUhvQixDQUFsQztBQThCQSxJQUFNdUUsMEJBQTBCLEdBQUc7QUFDakNsRyxXQUFTLEVBQUUsMEJBRHNCO0FBR2pDQyxZQUFVLEVBQUU7QUFDVnNCLFVBQU0sRUFBRTtBQUNOcEIsaUJBQVcsRUFBRSxlQURQO0FBRU5DLFVBQUksRUFBRSxRQUZBO0FBR05DLFdBQUssRUFBRTtBQUhELEtBREU7QUFNVnFFLFVBQU0sRUFBRTtBQUNOdkUsaUJBQVcsRUFBRSw2QkFEUDtBQUVOQyxVQUFJLEVBQUUsUUFGQTtBQUdOQyxXQUFLLEVBQUU7QUFIRCxLQU5FO0FBV1ZzRSxnQkFBWSxFQUFFO0FBQ1p4RSxpQkFBVyxFQUFFLDhCQUREO0FBRVpDLFVBQUksRUFBRSxRQUZNO0FBR1pDLFdBQUssRUFBRTtBQUhLLEtBWEo7QUFnQlZnQixTQUFLLEVBQUU7QUFDTGpCLFVBQUksRUFBRSxRQUREO0FBRUxELGlCQUFXLEVBQUUsdUNBRlI7QUFHTG1CLFdBQUssRUFBRTtBQUNMRSxZQUFJLEVBQUU7QUFDSnJCLHFCQUFXLEVBQUUsYUFEVDtBQUVKQyxjQUFJLEVBQUUsUUFGRjtBQUdKQyxlQUFLLEVBQUU7QUFISCxTQUREO0FBTUxvQixlQUFPLEVBQUU7QUFDUHRCLHFCQUFXLEVBQUUsZ0JBRE47QUFFUEMsY0FBSSxFQUFFLFFBRkM7QUFHUEMsZUFBSyxFQUFFO0FBSEEsU0FOSjtBQVdMcUIsY0FBTSxFQUFFO0FBQ052QixxQkFBVyxFQUFFLGVBRFA7QUFFTkMsY0FBSSxFQUFFLFFBRkE7QUFHTnVCLGtCQUFRLEVBQUUsSUFISjtBQUlOdEIsZUFBSyxFQUFFO0FBSkQ7QUFYSCxPQUhGO0FBcUJMc0IsY0FBUSxFQUFFO0FBckJMO0FBaEJHO0FBSHFCLENBQW5DO0FBNENBLElBQU13RSwwQkFBMEIsR0FBRztBQUNqQ25HLFdBQVMsRUFBRSwwQkFEc0I7QUFHakNDLFlBQVUsRUFBRTtBQUNWc0IsVUFBTSxFQUFFO0FBQ05wQixpQkFBVyxFQUFFLGVBRFA7QUFFTkMsVUFBSSxFQUFFLFFBRkE7QUFHTkMsV0FBSyxFQUFFO0FBSEQsS0FERTtBQU1WZ0IsU0FBSyxFQUFFO0FBQ0xqQixVQUFJLEVBQUUsUUFERDtBQUVMRCxpQkFBVyxFQUFFLHVDQUZSO0FBR0xtQixXQUFLLEVBQUU7QUFDTEUsWUFBSSxFQUFFO0FBQ0pyQixxQkFBVyxFQUFFLGFBRFQ7QUFFSkMsY0FBSSxFQUFFLFFBRkY7QUFHSkMsZUFBSyxFQUFFO0FBSEgsU0FERDtBQU1Mb0IsZUFBTyxFQUFFO0FBQ1B0QixxQkFBVyxFQUFFLGdCQUROO0FBRVBDLGNBQUksRUFBRSxRQUZDO0FBR1BDLGVBQUssRUFBRTtBQUhBLFNBTko7QUFXTHFCLGNBQU0sRUFBRTtBQUNOdkIscUJBQVcsRUFBRSxlQURQO0FBRU5DLGNBQUksRUFBRSxRQUZBO0FBR051QixrQkFBUSxFQUFFLElBSEo7QUFJTnRCLGVBQUssRUFBRTtBQUpEO0FBWEgsT0FIRjtBQXFCTHNCLGNBQVEsRUFBRTtBQXJCTDtBQU5HO0FBSHFCLENBQW5DO0FBa0NBLElBQU15RSwwQkFBMEIsR0FBRztBQUNqQ3BHLFdBQVMsRUFBRSwwQkFEc0I7QUFHakNDLFlBQVUsRUFBRTtBQUNWc0IsVUFBTSxFQUFFO0FBQ05wQixpQkFBVyxFQUFFLGVBRFA7QUFFTkMsVUFBSSxFQUFFLFFBRkE7QUFHTkMsV0FBSyxFQUFFO0FBSEQsS0FERTtBQU1WZ0IsU0FBSyxFQUFFO0FBQ0xqQixVQUFJLEVBQUUsUUFERDtBQUVMRCxpQkFBVyxFQUFFLHVDQUZSO0FBR0xtQixXQUFLLEVBQUU7QUFDTEUsWUFBSSxFQUFFO0FBQ0pyQixxQkFBVyxFQUFFLGFBRFQ7QUFFSkMsY0FBSSxFQUFFLFFBRkY7QUFHSkMsZUFBSyxFQUFFO0FBSEgsU0FERDtBQU1Mb0IsZUFBTyxFQUFFO0FBQ1B0QixxQkFBVyxFQUFFLGdCQUROO0FBRVBDLGNBQUksRUFBRSxRQUZDO0FBR1BDLGVBQUssRUFBRTtBQUhBLFNBTko7QUFXTHFCLGNBQU0sRUFBRTtBQUNOdkIscUJBQVcsRUFBRSxlQURQO0FBRU5DLGNBQUksRUFBRSxRQUZBO0FBR051QixrQkFBUSxFQUFFLElBSEo7QUFJTnRCLGVBQUssRUFBRTtBQUpEO0FBWEgsT0FIRjtBQXFCTHNCLGNBQVEsRUFBRTtBQXJCTDtBQU5HO0FBSHFCLENBQW5DOzs7Ozs7Ozs7Ozs7O0FDL3hCQTtBQUFBO0FBQUE7QUFBQSxJQUFNMEUsbUJBQW1CLEdBQUc7QUFDMUJyRyxXQUFTLEVBQUUsbUJBRGU7QUFHMUJDLFlBQVUsRUFBRTtBQUNWSyxZQUFRLEVBQUU7QUFBRUgsaUJBQVcsRUFBRSxnQkFBZjtBQUFpQ0MsVUFBSSxFQUFFLFFBQXZDO0FBQWlEQyxXQUFLLEVBQUU7QUFBeEQsS0FEQTtBQUVWRSxTQUFLLEVBQUU7QUFBRUosaUJBQVcsRUFBRSxnQkFBZjtBQUFpQ0MsVUFBSSxFQUFFLFFBQXZDO0FBQWlEQyxXQUFLLEVBQUU7QUFBeEQsS0FGRztBQUdWRyxZQUFRLEVBQUU7QUFBRUwsaUJBQVcsRUFBRSxpQkFBZjtBQUFrQ0MsVUFBSSxFQUFFLFFBQXhDO0FBQWtEQyxXQUFLLEVBQUU7QUFBekQsS0FIQTtBQUlWaUcsUUFBSSxFQUFFO0FBQ0puRyxpQkFBVyxFQUFFLGFBRFQ7QUFFSkMsVUFBSSxFQUFFLFFBRkY7QUFHSmMsWUFBTSxFQUFFLENBQUMsS0FBRCxFQUFRLE1BQVI7QUFISixLQUpJO0FBU1ZxRixXQUFPLEVBQUU7QUFDUHBHLGlCQUFXLEVBQUUsV0FETjtBQUVQQyxVQUFJLEVBQUUsUUFGQztBQUdQQyxXQUFLLEVBQUU7QUFIQSxLQVRDO0FBY1ZLLFFBQUksRUFBRTtBQUFFUCxpQkFBVyxFQUFFLHdCQUFmO0FBQXlDQyxVQUFJLEVBQUU7QUFBL0MsS0FkSTtBQWVWVyxVQUFNLEVBQUU7QUFBRVosaUJBQVcsRUFBRSxlQUFmO0FBQWdDQyxVQUFJLEVBQUU7QUFBdEMsS0FmRTtBQWdCVnFELFNBQUssRUFBRTtBQUFFdEQsaUJBQVcsRUFBRSxjQUFmO0FBQStCQyxVQUFJLEVBQUU7QUFBckM7QUFoQkc7QUFIYyxDQUE1QjtBQXVCQSxJQUFNb0csbUJBQW1CLEdBQUc7QUFDMUJ4RyxXQUFTLEVBQUUsbUJBRGU7QUFHMUJDLFlBQVUsRUFBRTtBQUNWc0csV0FBTyxFQUFFO0FBQUVwRyxpQkFBVyxFQUFFLGdCQUFmO0FBQWlDQyxVQUFJLEVBQUUsUUFBdkM7QUFBaURDLFdBQUssRUFBRTtBQUF4RCxLQURDO0FBRVZZLFdBQU8sRUFBRTtBQUNQZCxpQkFBVyxFQUFFLDZCQUROO0FBRVBDLFVBQUksRUFBRSxRQUZDO0FBR1BjLFlBQU0sRUFBRSxDQUFDLFFBQUQ7QUFIRCxLQUZDO0FBT1ZDLFdBQU8sRUFBRTtBQUNQaEIsaUJBQVcsRUFBRSx3QkFETjtBQUVQQyxVQUFJLEVBQUUsT0FGQztBQUdQZ0IsV0FBSyxFQUFFO0FBSEEsS0FQQztBQVlWQyxTQUFLLEVBQUU7QUFDTGxCLGlCQUFXLEVBQUUsc0JBRFI7QUFFTEMsVUFBSSxFQUFFLE9BRkQ7QUFHTGdCLFdBQUssRUFBRTtBQUNMaEIsWUFBSSxFQUFFLFFBREQ7QUFFTGtCLGFBQUssRUFBRTtBQUNMQyxnQkFBTSxFQUFFO0FBQUVuQixnQkFBSSxFQUFFLFFBQVI7QUFBa0JDLGlCQUFLLEVBQUU7QUFBekIsV0FESDtBQUVMZ0IsZUFBSyxFQUFFO0FBQ0xqQixnQkFBSSxFQUFFLFFBREQ7QUFFTEQsdUJBQVcsRUFBRSx1Q0FGUjtBQUdMbUIsaUJBQUssRUFBRTtBQUNMRSxrQkFBSSxFQUFFO0FBQ0pyQiwyQkFBVyxFQUFFLGFBRFQ7QUFFSkMsb0JBQUksRUFBRSxRQUZGO0FBR0pDLHFCQUFLLEVBQUU7QUFISCxlQUREO0FBTUxvQixxQkFBTyxFQUFFO0FBQ1B0QiwyQkFBVyxFQUFFLGdCQUROO0FBRVBDLG9CQUFJLEVBQUUsUUFGQztBQUdQQyxxQkFBSyxFQUFFO0FBSEEsZUFOSjtBQVdMcUIsb0JBQU0sRUFBRTtBQUNOdkIsMkJBQVcsRUFBRSxlQURQO0FBRU5DLG9CQUFJLEVBQUUsUUFGQTtBQUdOdUIsd0JBQVEsRUFBRSxJQUhKO0FBSU50QixxQkFBSyxFQUFFO0FBSkQ7QUFYSCxhQUhGO0FBcUJMc0Isb0JBQVEsRUFBRTtBQXJCTDtBQUZGO0FBRkY7QUFIRjtBQVpHO0FBSGMsQ0FBNUI7Ozs7Ozs7Ozs7Ozs7QUN2QkE7QUFBQTtBQUFBLElBQU04RSxlQUFlLEdBQUcsU0FBeEI7Ozs7Ozs7Ozs7Ozs7QUNBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBOzs7Ozs7Ozs7Ozs7O0FDQUE7QUFBQTtBQUFBO0FBQUEsSUFBTUMsZUFBZSxHQUFHLE1BQXhCO0FBQ0EsSUFBTUMsZ0JBQWdCLEdBQUcsT0FBekI7Ozs7Ozs7Ozs7Ozs7QUNEQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLElBQU1DLGNBQWMsR0FBRyxTQUF2QjtBQUNBLElBQU1DLGNBQWMsR0FBRyxTQUF2QjtBQUNBLElBQU1DLFdBQVcsR0FBRyxNQUFwQjtBQUNBLElBQU1DLGNBQWMsR0FBRyxTQUF2QjtBQUNBLElBQU1DLFlBQVksR0FBRyxPQUFyQjtBQUNBLElBQU1DLGVBQWUsR0FBRyxVQUF4Qjs7Ozs7Ozs7Ozs7OztBQ0xBO0FBQUE7QUFBQTtBQUFBO0FBQUEsSUFBTUMsc0JBQXNCLEdBQUcsVUFBL0I7QUFDQSxJQUFNQywyQkFBMkIsR0FBRyxlQUFwQztBQUNBLElBQU1DLDRCQUE0QixHQUFHLGdCQUFyQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUNGQTtBQUNBO0FBQ0E7QUFDQTtBQU1BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUVBOzs7Ozs7SUFLTUMsTzs7O0FBQ0o7Ozs7O0FBS0EsbUJBQVlDLE9BQVosRUFBcUJDLEtBQXJCLEVBQTRCO0FBQUE7O0FBQzFCLFNBQUtDLFFBQUwsR0FBZ0JGLE9BQWhCLENBRDBCLENBQ0Q7O0FBQ3pCLFNBQUtHLGFBQUwsR0FBcUJGLEtBQUssQ0FBQ0csWUFBM0IsQ0FGMEIsQ0FFZTs7QUFDekMsU0FBS0MsT0FBTCxHQUFlSixLQUFLLENBQUNoRyxNQUFyQixDQUgwQixDQUdHOztBQUM3QixTQUFLcUcsUUFBTCxHQUFnQkwsS0FBSyxDQUFDcEUsT0FBdEIsQ0FKMEIsQ0FJSzs7QUFDL0IsU0FBSzBFLEtBQUwsR0FBYU4sS0FBSyxDQUFDcEQsSUFBbkIsQ0FMMEIsQ0FLRDs7QUFDekIsU0FBSzJELE1BQUwsR0FBY1AsS0FBSyxDQUFDbkQsS0FBcEIsQ0FOMEIsQ0FNQzs7QUFDM0IsU0FBSzJELFNBQUwsR0FBaUJSLEtBQUssQ0FBQzFELFFBQU4sSUFBa0IsRUFBbkMsQ0FQMEIsQ0FPYTs7QUFDdkMsU0FBS21FLFNBQUwsR0FBaUJULEtBQUssQ0FBQ2pILFFBQXZCLENBUjBCLENBUU87O0FBQ2pDLFNBQUsySCxNQUFMLEdBQWNWLEtBQUssQ0FBQ2hILEtBQXBCLENBVDBCLENBU0M7O0FBQzNCLFNBQUsySCxTQUFMLEdBQWlCWCxLQUFLLENBQUMvRyxRQUF2QixDQVYwQixDQVVPOztBQUNqQyxTQUFLMkgsVUFBTCxHQUFrQlosS0FBSyxDQUFDOUcsU0FBeEIsQ0FYMEIsQ0FXUzs7QUFDbkMsU0FBSzJILGFBQUwsR0FBcUJiLEtBQUssQ0FBQ2MsWUFBM0IsQ0FaMEIsQ0FZZTs7QUFDekMsU0FBS0MscUJBQUwsR0FBNkJmLEtBQUssQ0FBQ2dCLG9CQUFOLElBQThCLElBQTNELENBYjBCLENBYXVDOztBQUNqRSxTQUFLQyx1QkFBTCxHQUNFakIsS0FBSyxDQUFDa0Isc0JBQU4sSUFBZ0MzSSxxRUFEbEMsQ0FkMEIsQ0FlbUM7O0FBQzdELFNBQUs0SSxTQUFMLEdBQWlCbkIsS0FBSyxDQUFDL0IsUUFBTixJQUFrQjtBQUFFbUQsZUFBUyxFQUFFO0FBQWIsS0FBbkMsQ0FoQjBCLENBZ0I0Qjs7QUFDdEQsU0FBS0MsV0FBTCxHQUFtQnJCLEtBQUssQ0FBQ3NCLFVBQU4sSUFBb0IsRUFBdkMsQ0FqQjBCLENBaUJpQjs7QUFDM0MsU0FBS0MsT0FBTCxHQUFlLEVBQWYsQ0FsQjBCLENBa0JQOztBQUNuQixTQUFLQyxXQUFMLEdBQW1CeEIsS0FBSyxDQUFDeUIsVUFBTixJQUFvQixFQUF2QyxDQW5CMEIsQ0FtQmlCOztBQUMzQyxTQUFLSixXQUFMLEdBQW1CckIsS0FBSyxDQUFDc0IsVUFBTixJQUFvQixFQUF2QyxDQXBCMEIsQ0FvQmlCOztBQUMzQyxTQUFLSSxRQUFMLEdBQWdCLEVBQWhCLENBckIwQixDQXFCTjs7QUFDcEIsU0FBS0MsWUFBTCxHQUFvQjNCLEtBQUssQ0FBQzRCLFdBQU4sSUFBcUIsRUFBekMsQ0F0QjBCLENBc0JtQjs7QUFDN0MsU0FBS0MsZ0JBQUwsR0FBd0I3QixLQUFLLENBQUM4QixlQUFOLElBQXlCLEtBQWpELENBdkIwQixDQXVCOEI7O0FBQ3hELFNBQUtDLGNBQUwsR0FBc0IvQixLQUFLLENBQUNnQyxhQUFOLElBQXVCLEtBQTdDLENBeEIwQixDQXdCMEI7O0FBQ3BELFNBQUtDLE9BQUwsR0FBZSxLQUFLRixjQUFMLEdBQ1h2Qyx1REFEVyxHQUVYUSxLQUFLLENBQUNrQyxNQUFOLElBQWdCN0MsdURBRnBCLENBekIwQixDQTJCVTs7QUFDcEMsU0FBSzhDLFVBQUwsR0FBa0JuQyxLQUFLLENBQUNvQyxTQUFOLElBQW1CQyw0Q0FBSyxHQUFHQyxNQUFSLEVBQXJDLENBNUIwQixDQTRCNkI7O0FBQ3ZELFNBQUtDLFFBQUwsR0FDRXZDLEtBQUssQ0FBQ3dDLE9BQU4sSUFBaUIsS0FBS1AsT0FBTCxLQUFpQnpDLHVEQUFsQyxHQUFtRDZDLDRDQUFLLEdBQUdDLE1BQVIsRUFBbkQsR0FBc0UsRUFEeEUsQ0E3QjBCLENBOEJrRDs7QUFDNUUsU0FBS0csWUFBTCxHQUFvQnpDLEtBQUssQ0FBQzBDLFdBQU4sSUFBcUIsS0FBekM7QUFDQSxTQUFLQyxZQUFMO0FBQ0EsU0FBS0MsY0FBTDs7QUFDQSxRQUFJLENBQUMsS0FBS0gsWUFBVixFQUF3QjtBQUN0QixXQUFLSSxZQUFMO0FBRUEsV0FBS0osWUFBTCxHQUFvQixJQUFwQjtBQUNEO0FBQ0Y7QUFFRDs7Ozs7Ozs7O21DQUtlO0FBQ2IsVUFBSTtBQUNGOztBQUNBO0FBQ0EsWUFBTUssY0FBYyxHQUFHQyxrRUFBUSxZQUFpQixLQUFLbEMsYUFBdkIsRUFBOUI7QUFDQTs7O0FBQ0EsYUFBS1osUUFBTCxDQUFjK0MsR0FBZCxDQUFrQkMsSUFBSSxDQUFDQyxTQUFMLENBQWVKLGNBQWYsQ0FBbEI7O0FBQ0EsWUFBTUssaUJBQWlCLEdBQUcsRUFBMUI7QUFDQUMsY0FBTSxDQUFDQyxtQkFBUCxDQUEyQlAsY0FBM0IsRUFDR1EsTUFESCxDQUNVLFVBQUFDLEdBQUc7QUFBQSxpQkFBSSxPQUFPVCxjQUFjLENBQUNTLEdBQUQsQ0FBckIsS0FBK0IsVUFBbkM7QUFBQSxTQURiLEVBRUdDLE9BRkgsQ0FFVyxVQUFBRCxHQUFHLEVBQUk7QUFDZEosMkJBQWlCLENBQUNJLEdBQUQsQ0FBakIsR0FBeUJULGNBQWMsQ0FBQ1MsR0FBRCxDQUF2QztBQUNELFNBSkg7O0FBS0EsYUFBS3RELFFBQUwsQ0FBYytDLEdBQWQsQ0FBa0JHLGlCQUFsQixFQVpFLENBYUY7OztBQUNBLGFBQUtNLGlCQUFMLEdBQXlCLElBQUlDLHNEQUFKO0FBQ3ZCM0QsaUJBQU8sRUFBRSxLQUFLRSxRQURTO0FBRXZCeUMscUJBQVcsRUFBRSxLQUFLdkIsU0FBTCxDQUFlc0IsWUFGTDtBQUd2Qm5HLGtCQUFRLEVBQUUsS0FBS2tFLFNBSFE7QUFJdkJ6SCxrQkFBUSxFQUFFLEtBQUswSCxTQUpRO0FBS3ZCekgsZUFBSyxFQUFFLEtBQUswSCxNQUxXO0FBTXZCekgsa0JBQVEsRUFBRSxLQUFLMEgsU0FOUTtBQU92QnpILG1CQUFTLEVBQUUsS0FBSzBILFVBUE87QUFRdkIrQyxnQkFBTSxFQUFFLEtBQUtBLE1BQUwsQ0FBWUMsSUFBWixDQUFpQixJQUFqQixDQVJlO0FBUVM7QUFDaENaLGFBQUcsRUFBRSxLQUFLQSxHQUFMLENBQVNZLElBQVQsQ0FBYyxJQUFkLENBVGtCO0FBU0c7QUFDMUJDLGtCQUFRLEVBQUUsS0FBS0EsUUFBTCxDQUFjRCxJQUFkLENBQW1CLElBQW5CLENBVmE7QUFVYTtBQUNwQ1QsMkJBQWlCLEVBQWpCQTtBQVh1QixXQVlwQixLQUFLaEMsU0FaZSxFQUF6QjtBQWNELE9BNUJELENBNEJFLE9BQU9ySCxLQUFQLEVBQWM7QUFDZCxjQUFNLElBQUlnSyxLQUFKLDJCQUE0QixLQUFLakQsYUFBakMsd0JBQTJEL0csS0FBM0QsRUFBTjtBQUNEO0FBQ0Y7QUFFRDs7Ozs7Ozs7cUNBS2lCO0FBQUE7O0FBQ2YsV0FBS2tKLEdBQUwsQ0FBUyxrQkFBVDs7QUFDQSxVQUFJO0FBQ0Y7QUFDQUksY0FBTSxDQUFDVyxJQUFQLENBQVksS0FBSzFDLFdBQWpCLEVBQThCbUMsT0FBOUIsQ0FBc0MsVUFBQUQsR0FBRyxFQUFJO0FBQzNDO0FBQ0EsY0FBTVMsU0FBUyxHQUFHLEtBQUksQ0FBQzNDLFdBQUwsQ0FBaUJrQyxHQUFqQixDQUFsQixDQUYyQyxDQUczQzs7QUFDQSxrQkFBUVMsU0FBUyxDQUFDbkwsSUFBbEI7QUFDRSxpQkFBS3NHLHdEQUFMO0FBQXNCO0FBQ3BCO0FBQ0Esb0JBQUk7QUFDRjs7QUFDQTtBQUNBLHNCQUFNOEUsZUFBZSxHQUFHbEIsa0VBQVEsWUFDOUJpQixTQUFTLENBQUNFLFFBRG1CLEVBQS9CO0FBR0E7QUFDQTs7O0FBQ0Esc0JBQU1DLGtCQUFrQixHQUFHLEVBQTNCO0FBQ0FmLHdCQUFNLENBQUNDLG1CQUFQLENBQTJCWSxlQUEzQixFQUNHWCxNQURILENBRUksVUFBQWMsT0FBTztBQUFBLDJCQUFJLE9BQU9ILGVBQWUsQ0FBQ0csT0FBRCxDQUF0QixLQUFvQyxVQUF4QztBQUFBLG1CQUZYLEVBSUdaLE9BSkgsQ0FJVyxVQUFBWSxPQUFPLEVBQUk7QUFDbEJELHNDQUFrQixDQUFDQyxPQUFELENBQWxCLEdBQThCSCxlQUFlLENBQUNHLE9BQUQsQ0FBN0M7QUFDRCxtQkFOSCxFQVRFLENBZ0JGOztBQUNBLHVCQUFJLFlBQUtiLEdBQUwsY0FBSixHQUEwQixJQUFJYyx1REFBSjtBQUN4QnRFLDJCQUFPLEVBQUUsS0FBSSxDQUFDRSxRQURVO0FBRXhCbEgsNEJBQVEsRUFBRSxLQUFJLENBQUMwSCxTQUZTO0FBR3hCekgseUJBQUssRUFBRSxLQUFJLENBQUMwSCxNQUhZO0FBSXhCekgsNEJBQVEsRUFBRSxLQUFJLENBQUMwSCxTQUpTO0FBS3hCekgsNkJBQVMsRUFBRSxLQUFJLENBQUMwSCxVQUxRO0FBTXhCb0MsdUJBQUcsRUFBRSxLQUFJLENBQUNBLEdBQUwsQ0FBU1ksSUFBVCxDQUFjLEtBQWQsQ0FObUI7QUFNRTtBQUMxQkMsNEJBQVEsRUFBRSxLQUFJLENBQUNBLFFBQUwsQ0FBY0QsSUFBZCxDQUFtQixLQUFuQixDQVBjO0FBT1k7QUFDcENPLHNDQUFrQixFQUFsQkE7QUFSd0IscUJBU3JCSCxTQVRxQixFQUExQjtBQVdELGlCQTVCRCxDQTRCRSxPQUFPTSxHQUFQLEVBQVk7QUFDWix3QkFBTSxJQUFJUixLQUFKLGdDQUFrQ1AsR0FBbEMsc0JBQWlEZSxHQUFqRCxFQUFOO0FBQ0Q7O0FBQ0Q7QUFDRDs7QUFDRCxpQkFBS2xGLHlEQUFMO0FBQXVCO0FBQ3JCO0FBQ0Esb0JBQUk7QUFDRjtBQUNBLHVCQUFJLFlBQUttRSxHQUFMLGNBQUosR0FBMEIsSUFBSWdCLG1FQUFKO0FBQ3hCeEUsMkJBQU8sRUFBRSxLQUFJLENBQUNFLFFBRFU7QUFFeEJsSCw0QkFBUSxFQUFFLEtBQUksQ0FBQzBILFNBRlM7QUFHeEJ6SCx5QkFBSyxFQUFFLEtBQUksQ0FBQzBILE1BSFk7QUFJeEJ6SCw0QkFBUSxFQUFFLEtBQUksQ0FBQzBILFNBSlM7QUFLeEJ6SCw2QkFBUyxFQUFFLEtBQUksQ0FBQzBILFVBTFE7QUFNeEI0RCwyQkFBTyxFQUFFUixTQUFTLENBQUNRLE9BTks7QUFPeEJ4Qix1QkFBRyxFQUFFLEtBQUksQ0FBQ0EsR0FBTCxDQUFTWSxJQUFULENBQWMsS0FBZCxDQVBtQjtBQU9FO0FBQzFCQyw0QkFBUSxFQUFFLEtBQUksQ0FBQ0EsUUFBTCxDQUFjRCxJQUFkLENBQW1CLEtBQW5CO0FBUmMscUJBU3JCSSxTQVRxQixFQUExQjtBQVdELGlCQWJELENBYUUsT0FBT00sR0FBUCxFQUFZO0FBQ1osd0JBQU0sSUFBSVIsS0FBSixzQ0FDMEJQLEdBRDFCLHNCQUN5Q2UsR0FEekMsRUFBTjtBQUdEOztBQUNEO0FBQ0Q7O0FBQ0Q7QUFDRTtBQUNBLG9CQUFNLElBQUlSLEtBQUosa0NBQW9DRSxTQUFTLENBQUNuTCxJQUE5QyxFQUFOO0FBNURKO0FBOERELFNBbEVEO0FBbUVELE9BckVELENBcUVFLE9BQU9pQixLQUFQLEVBQWM7QUFDZCxjQUFNLElBQUlnSyxLQUFKLDZCQUNnQixLQUFLakQsYUFEckIsd0JBQytDL0csS0FEL0MsRUFBTjtBQUdEO0FBQ0Y7QUFFRDs7Ozs7Ozs7bUNBS2U7QUFDYixXQUFLbUcsUUFBTCxDQUFjK0MsR0FBZCxDQUFrQixjQUFsQjs7QUFDQSxVQUFJO0FBQ0Y7QUFDQSxZQUFJLENBQUMsS0FBS1MsaUJBQUwsQ0FBdUJmLFdBQTVCLEVBQXlDO0FBQ3ZDO0FBQ0EsZUFBS2UsaUJBQUwsQ0FBdUJnQixJQUF2Qjs7QUFDQSxlQUFLaEIsaUJBQUwsQ0FBdUJmLFdBQXZCLEdBQXFDLElBQXJDLENBSHVDLENBSXZDOztBQUNBLGVBQUtyQixXQUFMLEdBQW1CLEtBQUtvQyxpQkFBTCxDQUF1Qm5DLFVBQTFDOztBQUNBLGVBQUtyQixRQUFMLENBQWMrQyxHQUFkLENBQWtCLEtBQUszQixXQUF2QixFQU51QyxDQU92Qzs7O0FBQ0EsZUFBS3VCLGNBQUwsR0FSdUMsQ0FTdkM7O0FBQ0EsZUFBSzhCLGNBQUw7QUFDRDtBQUNGLE9BZEQsQ0FjRSxPQUFPNUssS0FBUCxFQUFjO0FBQ2QsY0FBTSxJQUFJZ0ssS0FBSiwyQkFBNEIsS0FBS2pELGFBQWpDLHdCQUEyRC9HLEtBQTNELEVBQU47QUFDRDtBQUNGO0FBRUQ7Ozs7Ozs7O3FDQUtpQjtBQUFBOztBQUNmLFdBQUttRyxRQUFMLENBQWMrQyxHQUFkLENBQWtCLGdCQUFsQjs7QUFDQSxVQUFJO0FBQ0ZJLGNBQU0sQ0FBQ1csSUFBUCxDQUFZLEtBQUsxQyxXQUFqQixFQUE4Qm1DLE9BQTlCLENBQXNDLFVBQUFELEdBQUcsRUFBSTtBQUMzQyxjQUFJO0FBQ0YsZ0JBQUksQ0FBQyxNQUFJLFlBQUtBLEdBQUwsY0FBSixDQUF3QmIsV0FBN0IsRUFBMEM7QUFDeEMsb0JBQUksWUFBS2EsR0FBTCxjQUFKLENBQXdCa0IsSUFBeEI7O0FBQ0Esb0JBQUksWUFBS2xCLEdBQUwsY0FBSixDQUF3QmIsV0FBeEIsR0FBc0MsSUFBdEM7QUFDRDtBQUNGLFdBTEQsQ0FLRSxPQUFPNEIsR0FBUCxFQUFZO0FBQ1osa0JBQU0sSUFBSVIsS0FBSixzQ0FBd0NQLEdBQXhDLHNCQUF1RGUsR0FBdkQsRUFBTjtBQUNEO0FBQ0YsU0FURDtBQVVELE9BWEQsQ0FXRSxPQUFPeEssS0FBUCxFQUFjO0FBQ2QsY0FBTSxJQUFJZ0ssS0FBSiw2QkFDZ0IsS0FBS2pELGFBRHJCLHdCQUMrQy9HLEtBRC9DLEVBQU47QUFHRDtBQUNGO0FBRUQ7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQU1FLHFCQUFLbUcsUUFBTCxDQUFjK0MsR0FBZCxDQUFrQixnQkFBbEI7Ozs7dUJBRVEyQixPQUFPLENBQUNDLEdBQVIsQ0FDSnhCLE1BQU0sQ0FBQ1csSUFBUCxDQUFZLEtBQUsxQyxXQUFqQixFQUE4QndELEdBQTlCO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSx5RkFBa0MsaUJBQU10QixHQUFOO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFDaEMsa0NBQUksWUFBS0EsR0FBTCxjQUFKLENBQXdCdUIsWUFBeEIsQ0FDRSxNQUFJLENBQUN2RCxPQURQLEVBRUUsTUFBSSxDQUFDd0QsUUFGUCxFQUdFLE1BQUksQ0FBQ0MsYUFIUDs7QUFEZ0M7QUFBQSxtQ0FNMUIsTUFBSSxZQUFLekIsR0FBTCxjQUFKLENBQXdCMEIsSUFBeEIsRUFOMEI7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsbUJBQWxDOztBQUFBO0FBQUE7QUFBQTtBQUFBLG9CQURJLEM7Ozs7Ozs7OztzQkFXQSxJQUFJbkIsS0FBSixrQ0FDcUIsS0FBS2pELGFBRDFCLHNDOzs7Ozs7Ozs7Ozs7OztBQU1WOzs7Ozs7Ozs7MEJBTWE7QUFDWCxVQUFJLEtBQUtOLE1BQVQsRUFBaUI7QUFBQTs7QUFBQSwwQ0FEWjJFLElBQ1k7QUFEWkEsY0FDWTtBQUFBOztBQUNmLG1DQUFLakYsUUFBTCxDQUFjK0MsR0FBZCxFQUFrQm1DLElBQWxCLDhDQUFrQyxLQUFLakYsYUFBdkMsZUFBNERnRixJQUE1RDtBQUNEO0FBQ0Y7QUFFRDs7Ozs7Ozs7OzZCQU1TdkssSSxFQUFNO0FBQ2I7QUFDQXlLLHVFQUFhLENBQ1gsS0FBS25GLFFBRE0sRUFFWCxLQUZXLEVBR1hvRixnRUFBWSxDQUFDO0FBQ1gzSyxlQUFPLEVBQUUsS0FBS3dGLGFBREg7QUFFWHpILGlCQUFTLEVBQUUyQywrREFBaUIsQ0FBQzNDLFNBRmxCO0FBR1hrQyxZQUFJLEVBQUU7QUFDSlgsZ0JBQU0sRUFBRSxLQUFLb0csT0FEVDtBQUVKekYsY0FBSSxFQUFKQTtBQUZJO0FBSEssT0FBRCxDQUhELENBQWI7QUFZRDtBQUVEOzs7Ozs7Ozs7O0FBOEJBOzs7Ozs7Z0NBTWlEO0FBQUEsVUFBdkMySyxhQUF1Qyx1RUFBdkIsS0FBS3pELGdCQUFrQjtBQUMvQyxXQUFLbUIsR0FBTCxnQkFBd0JzQyxhQUF4QjtBQUNBLFdBQUsvRSxNQUFMLEdBQWMrRSxhQUFhLENBQUN6SSxLQUFkLElBQXVCLEtBQUswRCxNQUExQztBQUNBLFdBQUtDLFNBQUwsR0FBaUI4RSxhQUFhLENBQUNoSixRQUFkLElBQTBCLEtBQUtrRSxTQUFoRDtBQUNBLFdBQUtPLHFCQUFMLEdBQ0V1RSxhQUFhLENBQUN2RSxxQkFBZCxJQUF1QyxLQUFLQSxxQkFEOUM7QUFFQSxXQUFLRSx1QkFBTCxHQUNFcUUsYUFBYSxDQUFDckUsdUJBQWQsSUFBeUMsS0FBS0EsdUJBRGhEO0FBRUQ7QUFFRDs7Ozs7Ozs7Ozs7Ozs7Ozs7O3VCQU11QnNFLDRFQUFxQixDQUN4QyxLQUFLdEYsUUFEbUMsWUFFckMsS0FBS1EsU0FGZ0MsY0FFbkIsS0FBS0MsTUFGYyxjQUVKLEtBQUtDLFNBRkQsY0FFYyxLQUFLQyxVQUZuQixHQUd4QyxLQUFLSyx1QkFIbUMsQzs7O0FBQXBDdUUsc0I7O3FCQUtGQSxNQUFNLENBQUNDLFM7Ozs7O0FBQ1QscUJBQUtWLFFBQUwsR0FBZ0JTLE1BQU0sQ0FBQzdLLElBQVAsQ0FBWStLLE9BQVosRUFBaEI7Ozs7O3NCQUVNRixNQUFNLENBQUMxTCxLOzs7Ozs7Ozs7Ozs7OztBQUlqQjs7Ozs7Ozs7c0NBS2tCO0FBQUE7O0FBQ2hCLFdBQUtrTCxhQUFMLEdBQXFCO0FBQ25CNUwsWUFBSSxFQUFFLEVBRGE7QUFFbkJFLFlBQUksRUFBRSxFQUZhO0FBR25CQyxXQUFHLEVBQUUsRUFIYztBQUluQkYsYUFBSyxFQUFFLEVBSlk7QUFLbkJHLGNBQU0sRUFBRTtBQUxXLE9BQXJCOztBQU9BLFdBQUt1TCxRQUFMLENBQWN2QixPQUFkLENBQXNCLFVBQUFuSCxNQUFNLEVBQUk7QUFDOUIsY0FBSSxDQUFDMkksYUFBTCxDQUFtQjVMLElBQW5CLENBQXdCdU0sSUFBeEIsQ0FBNkJ0SixNQUFNLENBQUNqRCxJQUFwQzs7QUFDQSxjQUFJLENBQUM0TCxhQUFMLENBQW1CMUwsSUFBbkIsQ0FBd0JxTSxJQUF4QixDQUE2QnRKLE1BQU0sQ0FBQy9DLElBQXBDOztBQUNBLGNBQUksQ0FBQzBMLGFBQUwsQ0FBbUJ6TCxHQUFuQixDQUF1Qm9NLElBQXZCLENBQTRCdEosTUFBTSxDQUFDOUMsR0FBbkM7O0FBQ0EsY0FBSSxDQUFDeUwsYUFBTCxDQUFtQjNMLEtBQW5CLENBQXlCc00sSUFBekIsQ0FBOEJ0SixNQUFNLENBQUNoRCxLQUFyQzs7QUFDQSxjQUFJLENBQUMyTCxhQUFMLENBQW1CeEwsTUFBbkIsQ0FBMEJtTSxJQUExQixDQUErQnRKLE1BQU0sQ0FBQzdDLE1BQXRDO0FBQ0QsT0FORDtBQU9EO0FBRUQ7Ozs7Ozs7Ozs7OzsrRkFNbUI2QyxNOzs7Ozs7QUFFZixxQkFBSzJHLEdBQUwsQ0FBUyxjQUFULEUsQ0FDQTtBQUNBOztBQUNBLHFCQUFLekIsT0FBTCxHQUFlbEYsTUFBZixDLENBQ0E7O3FCQUNJLEtBQUswRSxxQjs7Ozs7O3VCQUVELEtBQUs2RSxZQUFMLEU7Ozs7Ozs7QUFFTjtBQUNBLHFCQUFLYixRQUFMLENBQWNZLElBQWQsQ0FBbUIsS0FBS3BFLE9BQXhCOzs7QUFFRjtBQUNBLHFCQUFLc0UsZUFBTCxHLENBQ0E7Ozs7dUJBQ00sS0FBS0MsY0FBTCxFOzs7QUFDTjtBQUNBLHFCQUFLQyxrQkFBTCxHLENBQ0E7O0FBQ0EscUJBQUt0QyxpQkFBTCxDQUF1QnFCLFlBQXZCLENBQW9DLEtBQUt2RCxPQUF6QyxFQUFrRCxLQUFLRixXQUF2RCxFLENBQ0E7OztBQUNBLHFCQUFLb0MsaUJBQUwsQ0FBdUJ1QyxLQUF2QixHLENBQ0E7Ozs7Ozs7Ozs7QUFFQSxxQkFBSy9GLFFBQUwsQ0FBYytDLEdBQWQsQ0FBa0JsSixLQUFsQjs7Ozs7Ozs7Ozs7Ozs7OztBQUtKOzs7Ozs7Ozs7cUNBTWlCO0FBQ2YsVUFBTW1NLFNBQVMsR0FBRyxTQUFaQSxTQUFZLENBQUFySixJQUFJLEVBQUk7QUFDeEIsZ0JBQVFBLElBQVI7QUFDRSxlQUFLLFVBQUw7QUFDRSxtQkFBTyxHQUFQOztBQUNGLGVBQUssVUFBTDtBQUNFLG1CQUFPLEdBQVA7O0FBQ0YsZUFBSyxVQUFMO0FBQ0UsbUJBQU8sR0FBUDs7QUFDRjtBQUNFLG1CQUFPLEdBQVA7QUFSSjtBQVVELE9BWEQ7O0FBWUEsdUJBQVUsS0FBSzZELFNBQWYsY0FBNEIsS0FBS0MsTUFBakMsY0FBMkMsS0FBS0MsU0FBaEQsY0FDRSxLQUFLQyxVQURQLGNBRUksS0FBS1IsT0FGVCxjQUVvQjZGLFNBQVMsQ0FBQyxLQUFLM0YsS0FBTixDQUY3QjtBQUdEO0FBRUQ7Ozs7Ozs7OzsyQkFNTzRGLE0sRUFBUTtBQUNiLFVBQU1DLFNBQVMsR0FBRztBQUNoQjNMLFVBQUUsRUFBRTRMLCtDQUFJLEVBRFE7QUFFaEJwTCxtQkFBVyxFQUFFLEtBRkc7QUFHaEJKLGlCQUFTLEVBQUUsSUFBSXlMLElBQUosRUFISztBQUloQjNMLGVBQU8sRUFBRSxLQUFLNEwsY0FBTCxFQUpPO0FBS2hCN04saUJBQVMsRUFBRWlELHFFQUF1QixDQUFDakQsU0FMbkI7QUFNaEJrQyxZQUFJLEVBQUU7QUFDSkgsWUFBRSxFQUFFNEwsK0NBQUksRUFETjtBQUVGeEssaUJBQU8sRUFBRSxLQUFLeUUsUUFGWjtBQUdGa0csbUJBQVMsRUFBRSxLQUFLbkcsT0FIZDtBQUlGckgsa0JBQVEsRUFBRSxLQUFLMEgsU0FKYjtBQUtGekgsZUFBSyxFQUFFLEtBQUswSCxNQUxWO0FBTUZ6SCxrQkFBUSxFQUFFLEtBQUswSDtBQU5iLFdBT0N1RixNQVBEO0FBTlksT0FBbEI7O0FBaUJBLFdBQUt4RSxRQUFMLENBQWNpRSxJQUFkLENBQW1CUSxTQUFuQjtBQUNEO0FBRUQ7Ozs7Ozs7OztBQVNBOzs7Ozt5Q0FLcUI7QUFBQTs7QUFDbkIsVUFBSTtBQUNGL0MsY0FBTSxDQUFDVyxJQUFQLENBQVksS0FBSzFDLFdBQWpCLEVBQThCbUMsT0FBOUIsQ0FBc0MsVUFBQWdELEdBQUcsRUFBSTtBQUMzQyxnQkFBSSxDQUFDbkYsV0FBTCxDQUFpQm1GLEdBQWpCLEVBQXNCOUQsV0FBdEIsR0FBb0MsTUFBSSxZQUFLOEQsR0FBTCxjQUFKLENBQXdCOUQsV0FBNUQ7QUFDQSxnQkFBSSxDQUFDckIsV0FBTCxDQUFpQm1GLEdBQWpCLEVBQXNCaEMsT0FBdEIsR0FBZ0MsTUFBSSxZQUFLZ0MsR0FBTCxjQUFKLENBQXdCaEMsT0FBeEQsQ0FGMkMsQ0FHM0M7O0FBQ0FwQixnQkFBTSxDQUFDVyxJQUFQLENBQVksTUFBSSxZQUFLeUMsR0FBTCxjQUFoQixFQUNHbEQsTUFESCxDQUNVLFVBQUFDLEdBQUc7QUFBQSxtQkFBSSxDQUFDQSxHQUFHLENBQUNrRCxVQUFKLENBQWUsR0FBZixDQUFMO0FBQUEsV0FEYixFQUN1QztBQUR2QyxXQUVHakQsT0FGSCxDQUVXLFVBQUFELEdBQUcsRUFBSTtBQUNkLGdCQUFJLE9BQU8sTUFBSSxZQUFLaUQsR0FBTCxjQUFKLENBQXdCakQsR0FBeEIsQ0FBUCxLQUF3QyxVQUE1QyxFQUNFLE1BQUksQ0FBQ2xDLFdBQUwsQ0FBaUJtRixHQUFqQixFQUFzQnBGLFNBQXRCLENBQWdDbUMsR0FBaEMsSUFBdUMsTUFBSSxZQUFLaUQsR0FBTCxjQUFKLENBQ3JDakQsR0FEcUMsQ0FBdkMsQ0FGWSxDQUlUO0FBQ04sV0FQSDtBQVFELFNBWkQ7QUFhRCxPQWRELENBY0UsT0FBT3pKLEtBQVAsRUFBYztBQUNkLGNBQU0sSUFBSWdLLEtBQUosc0RBRUYsS0FBS2pELGFBRkgsa0JBR0cvRyxLQUhILEVBQU47QUFLRDtBQUNGO0FBRUQ7Ozs7Ozs7O3VDQUttQjtBQUFBOztBQUNqQixVQUFJO0FBQ0YsYUFBS3FILFNBQUwsQ0FBZXNCLFlBQWYsR0FBOEIsS0FBS2dCLGlCQUFMLENBQXVCZixXQUFyRCxDQURFLENBRUY7O0FBQ0FVLGNBQU0sQ0FBQ1csSUFBUCxDQUFZLEtBQUtOLGlCQUFqQixFQUNHSCxNQURILENBQ1UsVUFBQUMsR0FBRztBQUFBLGlCQUFJLENBQUNBLEdBQUcsQ0FBQ2tELFVBQUosQ0FBZSxHQUFmLENBQUw7QUFBQSxTQURiLEVBQ3VDO0FBRHZDLFNBRUdqRCxPQUZILENBRVcsVUFBQUQsR0FBRyxFQUFJO0FBQ2QsY0FBSSxPQUFPLE1BQUksQ0FBQ0UsaUJBQUwsQ0FBdUJGLEdBQXZCLENBQVAsS0FBdUMsVUFBM0MsRUFDRSxNQUFJLENBQUNwQyxTQUFMLENBQWVDLFNBQWYsQ0FBeUJtQyxHQUF6QixJQUFnQyxNQUFJLENBQUNFLGlCQUFMLENBQXVCRixHQUF2QixDQUFoQyxDQUZZLENBRWlEO0FBQ2hFLFNBTEg7QUFNRCxPQVRELENBU0UsT0FBT3pKLEtBQVAsRUFBYztBQUNkLGNBQU0sSUFBSWdLLEtBQUosdUNBQzBCLEtBQUtqRCxhQUQvQixrQkFDbUQvRyxLQURuRCxFQUFOO0FBR0Q7QUFDRjtBQUVEOzs7Ozs7Ozs7O0FBa0NBOzs7Ozs7Ozs7Ozs7OztBQU1FLHFCQUFLa0osR0FBTCxXLENBQ0E7Ozt1QkFDcUIwRCx1RUFBZ0IsQ0FBQyxLQUFLekcsUUFBTixFQUFnQixLQUFLMEcsWUFBckIsQzs7O0FBQS9CbkIsc0I7O29CQUNEQSxNQUFNLENBQUNDLFM7Ozs7O3NCQUNKLElBQUkzQixLQUFKLCtCQUFpQzBCLE1BQU0sQ0FBQzFMLEtBQXhDLEU7Ozs7Ozs7Ozs7Ozs7O0FBR1Y7Ozs7Ozs7Ozs7Ozs7K0ZBT1VvSSxNLEVBQVFwSSxLOzs7OztBQUNoQixxQkFBS2tKLEdBQUw7QUFDQSxxQkFBS2YsT0FBTCxHQUFlQyxNQUFmO0FBQ0EscUJBQUswRSxNQUFMLEdBQWM5TSxLQUFkO0FBQ0EscUJBQUsrSCxnQkFBTCxHQUF3QixLQUF4QixDLENBQStCOztBQUMvQixxQkFBS0UsY0FBTCxHQUFzQixLQUF0QixDLENBQTZCOztBQUM3QixxQkFBS0osWUFBTCxHQUFvQixLQUFLRCxRQUF6QjtBQUNBLHFCQUFLRixXQUFMLEdBQW1CLEtBQUtELE9BQXhCOzt1QkFDTSxLQUFLc0YsSUFBTCxFOzs7Ozs7Ozs7Ozs7Ozs7O3dCQWxTSztBQUNYLGFBQU8sS0FBSzVFLE9BQVo7QUFDRDtBQUVEOzs7Ozs7OztBQVVBOzs7Ozs7c0JBTVdDLE0sRUFBUTtBQUNqQixVQUFJQSxNQUFKLEVBQVksS0FBS0QsT0FBTCxHQUFlQyxNQUFmO0FBQ2I7Ozt3QkFacUI7QUFDcEIsYUFBTyxLQUFLTCxnQkFBWjtBQUNEOzs7d0JBaUtZO0FBQ1gsYUFBTyxLQUFLSCxRQUFaO0FBQ0Q7Ozt3QkEyRGtCO0FBQ2pCLFdBQUtxRSxrQkFBTDtBQUNBLFdBQUtlLGdCQUFMO0FBQ0EsYUFBTztBQUNMM0csb0JBQVksRUFBRSxLQUFLRCxhQURkO0FBRUxsRyxjQUFNLEVBQUUsS0FBS29HLE9BRlI7QUFHTHhFLGVBQU8sRUFBRSxLQUFLeUUsUUFIVDtBQUlMekQsWUFBSSxFQUFFLEtBQUswRCxLQUpOO0FBS0x6RCxhQUFLLEVBQUUsS0FBSzBELE1BTFA7QUFNTGpFLGdCQUFRLEVBQUUsS0FBS2tFLFNBTlY7QUFPTHpILGdCQUFRLEVBQUUsS0FBSzBILFNBUFY7QUFRTHpILGFBQUssRUFBRSxLQUFLMEgsTUFSUDtBQVNMekgsZ0JBQVEsRUFBRSxLQUFLMEgsU0FUVjtBQVVMekgsaUJBQVMsRUFBRSxLQUFLMEgsVUFWWDtBQVdMYSxrQkFBVSxFQUFFLEtBQUtELFdBWFo7QUFZTEksbUJBQVcsRUFBRSxLQUFLRCxZQVpiO0FBYUxiLG9CQUFZLEVBQUUsS0FBS0QsYUFiZDtBQWNMNUMsZ0JBQVEsRUFBRSxLQUFLa0QsU0FkVjtBQWVMRyxrQkFBVSxFQUFFLEtBQUtELFdBZlo7QUFnQkxTLHVCQUFlLEVBQUUsS0FBS0QsZ0JBaEJqQjtBQWlCTEcscUJBQWEsRUFBRSxLQUFLRCxjQWpCZjtBQWtCTEcsY0FBTSxFQUFFLEtBQUtELE9BbEJSO0FBbUJMRyxpQkFBUyxFQUFFLEtBQUtELFVBbkJYO0FBb0JMSyxlQUFPLEVBQUUsS0FBS0QsUUFwQlQ7QUFxQkxHLG1CQUFXLEVBQUUsS0FBS0Q7QUFyQmIsT0FBUDtBQXVCRDs7Ozs7O0FBa0NZM0Msc0VBQWYsRTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7SUN4bEJNdUUsYTs7O0FBQ0oseUJBQVlyRSxLQUFaLEVBQW1CO0FBQUE7O0FBQUE7O0FBQ2pCLFNBQUtDLFFBQUwsR0FBZ0JELEtBQUssQ0FBQ0QsT0FBdEIsQ0FEaUIsQ0FDYzs7QUFDL0IsU0FBS2dILEtBQUwsR0FBYS9HLEtBQUssQ0FBQ2dILElBQW5CO0FBQ0EsU0FBS0MsY0FBTCxHQUFzQmpILEtBQUssQ0FBQ2tILGFBQTVCO0FBQ0EsU0FBS3pFLFlBQUwsR0FBb0J6QyxLQUFLLENBQUMwQyxXQUFOLElBQXFCLEtBQXpDLENBSmlCLENBSStCOztBQUNoRCxTQUFLakMsU0FBTCxHQUFpQlQsS0FBSyxDQUFDakgsUUFBdkI7QUFDQSxTQUFLMkgsTUFBTCxHQUFjVixLQUFLLENBQUNoSCxLQUFwQjtBQUNBLFNBQUsySCxTQUFMLEdBQWlCWCxLQUFLLENBQUMvRyxRQUF2QjtBQUNBLFNBQUsySCxVQUFMLEdBQWtCWixLQUFLLENBQUM5RyxTQUF4QjtBQUNBLFNBQUtpTyxRQUFMLEdBQWdCbkgsS0FBSyxDQUFDd0UsT0FBdEI7QUFDQSxTQUFLakQsT0FBTCxHQUFlLElBQWY7QUFDQSxTQUFLd0QsUUFBTCxHQUFnQixFQUFoQjtBQUNBLFNBQUtDLGFBQUwsR0FBcUI7QUFDbkI1TCxVQUFJLEVBQUUsRUFEYTtBQUVuQkUsVUFBSSxFQUFFLEVBRmE7QUFHbkJDLFNBQUcsRUFBRSxFQUhjO0FBSW5CRixXQUFLLEVBQUUsRUFKWTtBQUtuQkcsWUFBTSxFQUFFO0FBTFcsS0FBckI7QUFPQSxTQUFLNE4sZ0JBQUwsR0FBd0JwSCxLQUFLLENBQUNxSCxlQUFOLElBQXlCLEVBQWpEO0FBQ0EsU0FBS0MsSUFBTCxHQUFZdEgsS0FBSyxDQUFDZ0QsR0FBbEIsQ0FwQmlCLENBb0JNOztBQUN2QixTQUFLdUUsU0FBTCxHQUFpQnZILEtBQUssQ0FBQzZELFFBQXZCLENBckJpQixDQXFCZ0I7O0FBQ2pDLFFBQUk3RCxLQUFLLENBQUNvQixTQUFWLEVBQXFCO0FBQ25CZ0MsWUFBTSxDQUFDVyxJQUFQLENBQVkvRCxLQUFLLENBQUNvQixTQUFsQixFQUE2Qm9DLE9BQTdCLENBQXFDLFVBQUFELEdBQUcsRUFBSTtBQUMxQyxhQUFJLENBQUNBLEdBQUQsQ0FBSixHQUFZdkQsS0FBSyxDQUFDb0IsU0FBTixDQUFnQm1DLEdBQWhCLENBQVo7QUFDRCxPQUZEO0FBR0Q7O0FBQ0QsUUFBSXZELEtBQUssQ0FBQ21FLGtCQUFWLEVBQThCO0FBQzVCZixZQUFNLENBQUNDLG1CQUFQLENBQTJCckQsS0FBSyxDQUFDbUUsa0JBQWpDLEVBQXFEWCxPQUFyRCxDQUE2RCxVQUFBRCxHQUFHLEVBQUk7QUFDbEUsYUFBSSxDQUFDQSxHQUFELENBQUosR0FBWXZELEtBQUssQ0FBQ21FLGtCQUFOLENBQXlCWixHQUF6QixDQUFaO0FBQ0QsT0FGRDtBQUdEO0FBQ0Y7Ozs7MkJBRU0sQ0FBRTs7OzJCQUVGLENBQUU7OzsyQkFFRjtBQUNMLGFBQU9vQixPQUFPLENBQUM2QyxPQUFSLEVBQVA7QUFDRDs7O2tDQUVhbkwsTSxFQUFRb0wsTyxFQUFTQyxZLEVBQWM7QUFDM0MsV0FBS25HLE9BQUwsR0FBZWxGLE1BQWY7QUFDQSxXQUFLMEksUUFBTCxHQUFnQjBDLE9BQWhCO0FBQ0EsV0FBS3pDLGFBQUwsR0FBcUIwQyxZQUFyQjtBQUNEOzs7d0JBRWtCO0FBQ2pCLGFBQU8sS0FBS0MsYUFBWjtBQUNEOzs7d0JBRWlCO0FBQ2hCLGFBQU8sS0FBS2xGLFlBQVo7QUFDRCxLO3NCQUVlbUYsSyxFQUFPO0FBQ3JCLFdBQUtuRixZQUFMLEdBQW9CbUYsS0FBcEI7QUFDRDs7O3dCQUVhO0FBQ1osYUFBTyxLQUFLVCxRQUFaO0FBQ0Q7Ozt3QkFFYztBQUNiLGFBQU8sS0FBSzFHLFNBQVo7QUFDRDs7O3dCQUVXO0FBQ1YsYUFBTyxLQUFLQyxNQUFaO0FBQ0Q7Ozt3QkFFYztBQUNiLGFBQU8sS0FBS21ILFNBQVo7QUFDRDs7O3dCQUVlO0FBQ2QsYUFBTyxLQUFLakgsVUFBWjtBQUNEOzs7d0JBRVk7QUFDWCxhQUFPLEtBQUtXLE9BQVo7QUFDRDs7O3dCQUVhO0FBQ1osYUFBTyxLQUFLd0QsUUFBWjtBQUNEOzs7d0JBRWtCO0FBQ2pCLGFBQU8sS0FBS0MsYUFBWjtBQUNEOzs7d0JBRVM7QUFDUixhQUFPLEtBQUtzQyxJQUFaO0FBQ0Q7Ozt3QkFFYztBQUNiLGFBQU8sS0FBS0MsU0FBWjtBQUNEOzs7Ozs7QUFHWWxELDRFQUFmLEU7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDdEdBOztJQUVNWCxZOzs7QUFDSix3QkFBWTFELEtBQVosRUFBbUI7QUFBQTs7QUFBQTs7QUFDakIsU0FBS0MsUUFBTCxHQUFnQkQsS0FBSyxDQUFDRCxPQUF0QixDQURpQixDQUNjOztBQUMvQixTQUFLMEMsWUFBTCxHQUFvQnpDLEtBQUssQ0FBQzBDLFdBQU4sSUFBcUIsS0FBekMsQ0FGaUIsQ0FFK0I7O0FBQ2hELFNBQUtsQyxTQUFMLEdBQWlCUixLQUFLLENBQUMxRCxRQUF2QjtBQUNBLFNBQUttRSxTQUFMLEdBQWlCVCxLQUFLLENBQUNqSCxRQUF2QjtBQUNBLFNBQUsySCxNQUFMLEdBQWNWLEtBQUssQ0FBQ2hILEtBQXBCO0FBQ0EsU0FBSzJILFNBQUwsR0FBaUJYLEtBQUssQ0FBQy9HLFFBQXZCO0FBQ0EsU0FBSzJILFVBQUwsR0FBa0JaLEtBQUssQ0FBQzlHLFNBQXhCO0FBQ0EsU0FBS3FJLE9BQUwsR0FBZSxJQUFmO0FBQ0EsU0FBS0YsV0FBTCxHQUFtQnJCLEtBQUssQ0FBQ3NCLFVBQU4sSUFBb0IsRUFBdkM7QUFDQSxTQUFLd0csT0FBTCxHQUFlOUgsS0FBSyxDQUFDMkQsTUFBckIsQ0FWaUIsQ0FVWTs7QUFDN0IsU0FBSzJELElBQUwsR0FBWXRILEtBQUssQ0FBQ2dELEdBQWxCLENBWGlCLENBV007O0FBQ3ZCLFNBQUt1RSxTQUFMLEdBQWlCdkgsS0FBSyxDQUFDNkQsUUFBdkIsQ0FaaUIsQ0FZZ0I7O0FBQ2pDLFFBQUk3RCxLQUFLLENBQUNvQixTQUFWLEVBQXFCO0FBQ25CZ0MsWUFBTSxDQUFDVyxJQUFQLENBQVkvRCxLQUFLLENBQUNvQixTQUFsQixFQUE2Qm9DLE9BQTdCLENBQXFDLFVBQUFELEdBQUcsRUFBSTtBQUMxQyxhQUFJLENBQUNBLEdBQUQsQ0FBSixHQUFZdkQsS0FBSyxDQUFDb0IsU0FBTixDQUFnQm1DLEdBQWhCLENBQVo7QUFDRCxPQUZEO0FBR0Q7O0FBQ0QsUUFBSXZELEtBQUssQ0FBQ21ELGlCQUFWLEVBQTZCO0FBQzNCQyxZQUFNLENBQUNDLG1CQUFQLENBQTJCckQsS0FBSyxDQUFDbUQsaUJBQWpDLEVBQW9ESyxPQUFwRCxDQUE0RCxVQUFBRCxHQUFHLEVBQUk7QUFDakUsYUFBSSxDQUFDdEQsUUFBTCxDQUFjK0MsR0FBZCxDQUFrQmhELEtBQUssQ0FBQ21ELGlCQUFOLENBQXdCSSxHQUF4QixDQUFsQjs7QUFDQSxhQUFJLENBQUNBLEdBQUQsQ0FBSixHQUFZdkQsS0FBSyxDQUFDbUQsaUJBQU4sQ0FBd0JJLEdBQXhCLENBQVo7QUFDRCxPQUhEO0FBSUQ7QUFDRjs7OzsyQkFFTSxDQUFFOzs7NEJBRUQsQ0FBRTs7O2tDQUVJbEgsTSxFQUFRaUYsVSxFQUFZO0FBQUE7O0FBQ2hDLFdBQUtDLE9BQUwsR0FBZWxGLE1BQWY7QUFDQSxXQUFLZ0YsV0FBTCxHQUFtQkMsVUFBbkI7QUFDQThCLFlBQU0sQ0FBQ1csSUFBUCxDQUFZLEtBQUsxQyxXQUFqQixFQUE4Qm1DLE9BQTlCLENBQXNDLFVBQUFELEdBQUcsRUFBSTtBQUMzQyxZQUFJLE1BQUksQ0FBQ2xDLFdBQUwsQ0FBaUJrQyxHQUFqQixFQUFzQm5DLFNBQTFCLEVBQ0VnQyxNQUFNLENBQUNXLElBQVAsQ0FBWSxNQUFJLENBQUMxQyxXQUFMLENBQWlCa0MsR0FBakIsRUFBc0JuQyxTQUFsQyxFQUE2Q29DLE9BQTdDLENBQXFELFVBQUF1RSxRQUFRLEVBQUk7QUFDL0QsZ0JBQUksQ0FBQzFHLFdBQUwsQ0FBaUJrQyxHQUFqQixFQUFzQndFLFFBQXRCLElBQWtDLE1BQUksQ0FBQzFHLFdBQUwsQ0FBaUJrQyxHQUFqQixFQUFzQm5DLFNBQXRCLENBQ2hDMkcsUUFEZ0MsQ0FBbEM7QUFHRCxTQUpEO0FBS0gsT0FQRDs7QUFRQSxXQUFLOUgsUUFBTCxDQUFjK0MsR0FBZCxDQUFrQixLQUFLM0IsV0FBdkI7QUFDRDs7O2tDQU1hMkYsSSxFQUFNRSxhLEVBQWUxQyxPLEVBQVM7QUFDMUMsV0FBS25ELFdBQUwsQ0FBaUIyRixJQUFqQixJQUF5QixFQUF6QjtBQUNBLFdBQUszRixXQUFMLENBQWlCMkYsSUFBakIsRUFBdUJBLElBQXZCLEdBQThCQSxJQUE5QjtBQUNBLFdBQUszRixXQUFMLENBQWlCMkYsSUFBakIsRUFBdUJFLGFBQXZCLEdBQXVDQSxhQUF2QztBQUNBLFdBQUs3RixXQUFMLENBQWlCMkYsSUFBakIsRUFBdUI5QyxRQUF2QixHQUFrQ2dELGFBQWxDO0FBQ0EsV0FBSzdGLFdBQUwsQ0FBaUIyRixJQUFqQixFQUF1Qm5PLElBQXZCLEdBQThCc0csd0RBQTlCO0FBQ0EsV0FBS2tDLFdBQUwsQ0FBaUIyRixJQUFqQixFQUF1QnhDLE9BQXZCLEdBQWlDQSxPQUFqQztBQUNBLFdBQUtuRCxXQUFMLENBQWlCMkYsSUFBakIsRUFBdUI1RixTQUF2QixHQUFtQyxFQUFuQztBQUNEOzs7dUNBTWtCNEYsSSxFQUFNRSxhLEVBQWUxQyxPLEVBQVM7QUFDL0MsV0FBS3dELGFBQUwsQ0FBbUJoQixJQUFuQixFQUF5QkUsYUFBekIsRUFBd0MxQyxPQUF4Qzs7QUFDQSxXQUFLbkQsV0FBTCxDQUFpQjJGLElBQWpCLEVBQXVCbk8sSUFBdkIsR0FBOEJ1Ryx5REFBOUI7QUFDRDs7O3dCQXJCa0I7QUFDakIsYUFBTyxLQUFLdUksYUFBWjtBQUNEOzs7d0JBWWtCO0FBQ2pCLGFBQU8sS0FBS0ssYUFBWjtBQUNEOzs7d0JBT3VCO0FBQ3RCLGFBQU8sS0FBS0Msa0JBQVo7QUFDRDs7O3dCQUVpQjtBQUNoQixhQUFPLEtBQUt4RixZQUFaO0FBQ0QsSztzQkFFZW1GLEssRUFBTztBQUNyQixXQUFLbkYsWUFBTCxHQUFvQm1GLEtBQXBCO0FBQ0Q7Ozt3QkFFYztBQUNiLGFBQU8sS0FBS3BILFNBQVo7QUFDRDs7O3dCQUVjO0FBQ2IsYUFBTyxLQUFLQyxTQUFaO0FBQ0Q7Ozt3QkFFVztBQUNWLGFBQU8sS0FBS0MsTUFBWjtBQUNEOzs7d0JBRWM7QUFDYixhQUFPLEtBQUttSCxTQUFaO0FBQ0Q7Ozt3QkFFZTtBQUNkLGFBQU8sS0FBS2pILFVBQVo7QUFDRDs7O3dCQUVZO0FBQ1gsYUFBTyxLQUFLVyxPQUFaO0FBQ0Q7Ozt3QkFFZ0I7QUFDZixhQUFPLEtBQUtGLFdBQVo7QUFDRDs7O3dCQUVZO0FBQ1gsYUFBTyxLQUFLeUcsT0FBWjtBQUNEOzs7d0JBRVM7QUFDUixhQUFPLEtBQUtSLElBQVo7QUFDRDs7O3dCQUVjO0FBQ2IsYUFBTyxLQUFLQyxTQUFaO0FBQ0Q7Ozs7OztBQUdZN0QsMkVBQWYsRTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQzNIQTtBQU1BO0FBQ0E7QUFFQTs7Ozs7Ozs7U0FPZXdFLE87Ozs7Ozs7eUVBQWYsaUJBQXVCbkksT0FBdkIsRUFBZ0NDLEtBQWhDLEVBQXVDM0QsTUFBdkM7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQ0UwRCxtQkFBTyxDQUFDaUQsR0FBUixDQUFZLFNBQVo7QUFERjtBQUlJO0FBQ0FtRixtQkFBTyxHQUFHLElBQUlySSxnREFBSixDQUFZQyxPQUFaLEVBQXFCQyxLQUFyQixDQUFWLENBTEosQ0FNSTs7QUFOSixrQkFPUW1JLE9BQU8sQ0FBQ2pHLE1BQVIsS0FBbUIxQyx1REFBbkIsSUFBcUMySSxPQUFPLENBQUNqRyxNQUFSLEtBQW1CekMscURBUGhFO0FBQUE7QUFBQTtBQUFBOztBQVFNO0FBQ0EwSSxtQkFBTyxDQUFDQyxHQUFSLENBQVlELE9BQU8sQ0FBQ2pHLE1BQXBCO0FBVE4sNkNBV2E7QUFBRXVELHVCQUFTLEVBQUUsSUFBYjtBQUFtQnpMLG9CQUFNLEVBQUVnRyxLQUFLLENBQUNoRztBQUFqQyxhQVhiOztBQUFBO0FBYUk7QUFDQSxnQkFBSW1PLE9BQU8sQ0FBQ3JHLGVBQVosRUFBNkI7QUFDM0I7QUFDQXFHLHFCQUFPLENBQUNFLFNBQVI7QUFDRCxhQWpCTCxDQWtCSTs7O0FBQ0FGLG1CQUFPLENBQUNqRyxNQUFSLEdBQWlCM0Msb0RBQWpCO0FBbkJKO0FBQUEsbUJBb0JVNEksT0FBTyxDQUFDdEIsSUFBUixFQXBCVjs7QUFBQTtBQUFBO0FBQUEsbUJBc0JVc0IsT0FBTyxDQUFDckQsWUFBUixDQUFxQnpJLE1BQXJCLENBdEJWOztBQUFBO0FBQUEsa0JBd0JROEwsT0FBTyxDQUFDRyxNQUFSLENBQWVDLE1BQWYsR0FBd0IsQ0F4QmhDO0FBQUE7QUFBQTtBQUFBOztBQUFBO0FBQUEsbUJBMEJ3Q25ELGdFQUFhLENBQzdDckYsT0FENkMsRUFFN0MsU0FGNkMsRUFHN0NvSSxPQUFPLENBQUNHLE1BSHFDLENBMUJyRDs7QUFBQTtBQTBCWUUsK0JBMUJaOztBQUFBLGdCQWdDV0EsbUJBQW1CLENBQUMvQyxTQWhDL0I7QUFBQTtBQUFBO0FBQUE7O0FBQUEsa0JBaUNjK0MsbUJBakNkOztBQUFBO0FBQUE7QUFBQSxtQkFxQ1VMLE9BQU8sQ0FBQ0MsR0FBUixDQUFZL0ksdURBQVosQ0FyQ1Y7O0FBQUE7QUFBQTtBQUFBLG1CQXVDVThJLE9BQU8sQ0FBQ3RFLFFBQVIsQ0FBaUJzRSxPQUFPLENBQUN4QixZQUF6QixDQXZDVjs7QUFBQTtBQUFBLDZDQXdDVztBQUFFbEIsdUJBQVMsRUFBRSxJQUFiO0FBQW1Cekwsb0JBQU0sRUFBRWdHLEtBQUssQ0FBQ2hHO0FBQWpDLGFBeENYOztBQUFBO0FBQUE7QUFBQTtBQTBDSStGLG1CQUFPLENBQUNpRCxHQUFSLENBQVlsSixLQUFaLGNBQXlCa0csS0FBSyxDQUFDaEcsTUFBL0IsRUExQ0osQ0EyQ0k7O0FBM0NKLGlCQTRDUW1PLE9BNUNSO0FBQUE7QUFBQTtBQUFBOztBQUFBO0FBQUEsbUJBOENZQSxPQUFPLENBQUNDLEdBQVIsQ0FBWS9JLHVEQUFaLGNBOUNaOztBQUFBO0FBQUEsNkNBZ0RXO0FBQUVvRyx1QkFBUyxFQUFFLEtBQWI7QUFBb0J6TCxvQkFBTSxFQUFFZ0csS0FBSyxDQUFDaEcsTUFBbEM7QUFBMENGLG1CQUFLLEVBQUUsWUFBTUk7QUFBdkQsYUFoRFg7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsRzs7OztBQW9EZWdPLHNFQUFmLEU7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDcEVBO0FBQ0E7QUFPQTtBQUNBO0FBQ0E7QUFNQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7OztTQU1lTyxXOzs7QUEwQ2Y7Ozs7Ozs7Ozs7O3lFQTFDQSxpQkFBMkIxSSxPQUEzQixFQUFvQzJJLFNBQXBDO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBRUk7QUFDTVAsbUJBSFYsR0FHb0IsSUFBSXJJLGdEQUFKLENBQVlDLE9BQVosRUFBcUIySSxTQUFyQixDQUhwQixFQUlJOztBQUNBUCxtQkFBTyxDQUFDQyxHQUFSLENBQVkvSSx1REFBWixFQUxKLENBTUk7O0FBTko7QUFBQSxtQkFPVStGLGdFQUFhLENBQ2pCckYsT0FEaUIsRUFFakIsT0FGaUIsRUFHakJzRiwrREFBWSxDQUFDO0FBQ1gzSyxxQkFBTyxFQUFFZ08sU0FBUyxDQUFDdkksWUFEUjtBQUVYMUgsdUJBQVMsRUFBRTJGLHlFQUEyQixDQUFDM0YsU0FGNUI7QUFHWGtDLGtCQUFJLEVBQUU7QUFDSlgsc0JBQU0sRUFBRTBPLFNBQVMsQ0FBQzFPLE1BRGQ7QUFFSm1ELHNCQUFNLEVBQUV1TCxTQUFTLENBQUMxTyxNQUZkO0FBR0pvRCw0QkFBWSxFQUFFdUwsc0VBQVUsQ0FDdEJELFNBQVMsQ0FBQzNQLFFBRFksRUFFdEIyUCxTQUFTLENBQUMxUCxLQUZZLEVBR3RCMFAsU0FBUyxDQUFDelAsUUFIWSxFQUl0QnlQLFNBQVMsQ0FBQ3hQLFNBSlk7QUFIcEI7QUFISyxhQUFELENBSEssQ0FQdkI7O0FBQUE7QUFBQTtBQUFBOztBQUFBO0FBQUE7QUFBQTtBQTBCSTZHLG1CQUFPLENBQUNpRCxHQUFSLENBQVlsSixLQUFaLENBQWtCLHlCQUFsQixlQUFvRDRPLFNBQXBELEVBMUJKLENBMkJJOztBQTNCSjtBQUFBLG1CQTRCVXRELGdFQUFhLENBQ2pCckYsT0FEaUIsRUFFakIsT0FGaUIsRUFHakJzRiwrREFBWSxDQUFDO0FBQ1gzSyxxQkFBTyxFQUFFZ08sU0FBUyxDQUFDdkksWUFEUjtBQUVYMUgsdUJBQVMsRUFBRTJGLHlFQUEyQixDQUFDM0YsU0FGNUI7QUFHWGtDLGtCQUFJLEVBQUU7QUFDSlgsc0JBQU0sRUFBRTBPLFNBQVMsQ0FBQzFPLE1BRGQ7QUFFSkYscUJBQUs7QUFGRDtBQUhLLGFBQUQsQ0FISyxDQTVCdkI7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsRzs7OztTQWdEZThPLFU7OztBQTJEZjs7Ozs7Ozs7Ozs7eUVBM0RBLGtCQUEwQjdJLE9BQTFCLEVBQW1DMkksU0FBbkM7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLG1CQUdtQ0cscUVBQWUsQ0FBQzlJLE9BQUQsRUFBVTtBQUN0RDVDLG9CQUFNLEVBQUV1TCxTQUFTLENBQUN2TCxNQURvQztBQUV0REMsMEJBQVksRUFBRXNMLFNBQVMsQ0FBQ3RMO0FBRjhCLGFBQVYsQ0FIbEQ7O0FBQUE7QUFHVTBMLDRCQUhWOztBQUFBLGdCQVFTQSxnQkFBZ0IsQ0FBQ3JELFNBUjFCO0FBQUE7QUFBQTtBQUFBOztBQUFBLGtCQVEyQ3FELGdCQVIzQzs7QUFBQTtBQVNJO0FBQ01DLHdCQVZWLEdBVXlCRCxnQkFBZ0IsQ0FBQ25PLElBVjFDLEVBV0k7O0FBQ01xTyxvQkFaVixHQVlxQjtBQUNmQyxvQkFBTSxFQUFFUCxTQUFTLENBQUN2TCxNQURIO0FBRWYrTCwwQkFBWSxFQUFFUixTQUFTLENBQUN0TDtBQUZULGFBWnJCLEVBZ0JJOztBQUNBLGdCQUFJMkwsWUFBWSxDQUFDN0csTUFBYixLQUF3QjNDLG9EQUE1QixFQUF5QztBQUN2QztBQUNBeUosc0JBQVEsQ0FBQ2hILGFBQVQsR0FBeUIsSUFBekI7QUFDRCxhQUhELE1BR087QUFDTDtBQUNBZ0gsc0JBQVEsQ0FBQzlHLE1BQVQsR0FBa0IxQyx1REFBbEI7QUFDQXdKLHNCQUFRLENBQUN4RyxPQUFULEdBQW1CSCw0Q0FBSyxHQUFHQyxNQUFSLEVBQW5CO0FBQ0QsYUF4QkwsQ0F5Qkk7OztBQXpCSjtBQUFBLG1CQTBCeUI2Ryx3RUFBa0IsQ0FBQ3BKLE9BQUQsRUFBVWlKLFFBQVYsQ0ExQjNDOztBQUFBO0FBMEJVeEQsa0JBMUJWOztBQUFBLGdCQTRCU0EsTUFBTSxDQUFDQyxTQTVCaEI7QUFBQTtBQUFBO0FBQUE7O0FBQUEsa0JBNkJZLElBQUkzQixLQUFKLCtCQUFpQzBCLE1BQU0sQ0FBQzFMLEtBQXhDLEVBN0JaOztBQUFBO0FBQUE7QUFBQSxtQkErQlVzTCxnRUFBYSxDQUNqQnJGLE9BRGlCLEVBRWpCLE9BRmlCLEVBR2pCc0YsK0RBQVksQ0FBQztBQUNYM0sscUJBQU8sRUFBRWdPLFNBQVMsQ0FBQ3ZJLFlBRFI7QUFFWDFILHVCQUFTLEVBQUU0Rix5RUFBMkIsQ0FBQzVGLFNBRjVCO0FBR1hrQyxrQkFBSSxFQUFFO0FBQ0pYLHNCQUFNLEVBQUUwTyxTQUFTLENBQUMxTztBQURkO0FBSEssYUFBRCxDQUhLLENBL0J2Qjs7QUFBQTtBQUFBO0FBQUE7O0FBQUE7QUFBQTtBQUFBO0FBMkNJK0YsbUJBQU8sQ0FBQ2lELEdBQVIsQ0FBWWxKLEtBQVosQ0FBa0IseUJBQWxCLGdCQUFvRDRPLFNBQXBELEVBM0NKLENBNENJOztBQTVDSjtBQUFBLG1CQTZDVXRELGdFQUFhLENBQ2pCckYsT0FEaUIsRUFFakIsT0FGaUIsRUFHakJzRiwrREFBWSxDQUFDO0FBQ1gzSyxxQkFBTyxFQUFFZ08sU0FBUyxDQUFDdkksWUFEUjtBQUVYMUgsdUJBQVMsRUFBRTRGLHlFQUEyQixDQUFDNUYsU0FGNUI7QUFHWGtDLGtCQUFJLEVBQUU7QUFDSlgsc0JBQU0sRUFBRTBPLFNBQVMsQ0FBQzFPLE1BRGQ7QUFFSkYscUJBQUs7QUFGRDtBQUhLLGFBQUQsQ0FISyxDQTdDdkI7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsRzs7OztTQWlFZXNQLFk7OztBQTZEZjs7Ozs7Ozs7Ozs7eUVBN0RBLGtCQUE0QnJKLE9BQTVCLEVBQXFDMkksU0FBckM7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLG1CQUV5Q0cscUVBQWUsQ0FBQzlJLE9BQUQsRUFBVTJJLFNBQVYsQ0FGeEQ7O0FBQUE7QUFFVVcsa0NBRlY7O0FBQUEsaUJBR1FBLHNCQUFzQixDQUFDNUQsU0FIL0I7QUFBQTtBQUFBO0FBQUE7O0FBSVk2RCw4QkFKWixHQUlpQ0Qsc0JBQXNCLENBQUMxTyxJQUp4RDtBQUtZcU8sb0JBTFosR0FLdUI7QUFDZkMsb0JBQU0sRUFBRVAsU0FBUyxDQUFDdkwsTUFESDtBQUVmK0wsMEJBQVksRUFBRVIsU0FBUyxDQUFDdEw7QUFGVCxhQUx2QixFQVNNOztBQUNBLGdCQUFJa00sa0JBQWtCLENBQUNwSCxNQUFuQixLQUE4QjNDLG9EQUFsQyxFQUErQztBQUM3Q3lKLHNCQUFRLENBQUNsSCxlQUFULEdBQTJCO0FBQ3pCM0IsNEJBQVksRUFBRXVJLFNBQVMsQ0FBQ3ZJLFlBREM7QUFFekJ0RCxxQkFBSyxFQUFFNkwsU0FBUyxDQUFDN0wsS0FGUTtBQUd6QlAsd0JBQVEsRUFBRW9NLFNBQVMsQ0FBQ3BNLFFBSEs7QUFJekIwRSxvQ0FBb0IsRUFBRTBILFNBQVMsQ0FBQzFILG9CQUpQO0FBS3pCRSxzQ0FBc0IsRUFBRXdILFNBQVMsQ0FBQ3hIO0FBTFQsZUFBM0I7QUFPRCxhQVJELE1BUU87QUFDTDhILHNCQUFRLENBQUM3SSxZQUFULEdBQXdCdUksU0FBUyxDQUFDdkksWUFBbEM7QUFDQTZJLHNCQUFRLENBQUNuTSxLQUFULEdBQWlCNkwsU0FBUyxDQUFDN0wsS0FBM0I7QUFDQW1NLHNCQUFRLENBQUMxTSxRQUFULEdBQW9Cb00sU0FBUyxDQUFDcE0sUUFBOUI7QUFDQTBNLHNCQUFRLENBQUNoSSxvQkFBVCxHQUFnQzBILFNBQVMsQ0FBQzFILG9CQUExQztBQUNBZ0ksc0JBQVEsQ0FBQzlILHNCQUFULEdBQWtDd0gsU0FBUyxDQUFDeEgsc0JBQTVDO0FBQ0Q7O0FBeEJQO0FBQUEsbUJBeUIyQmlJLHdFQUFrQixDQUFDcEosT0FBRCxFQUFVaUosUUFBVixDQXpCN0M7O0FBQUE7QUF5Qll4RCxrQkF6Qlo7O0FBQUEsZ0JBMEJXQSxNQUFNLENBQUNDLFNBMUJsQjtBQUFBO0FBQUE7QUFBQTs7QUFBQSxrQkEyQmMsSUFBSTNCLEtBQUosK0JBQWlDMEIsTUFBTSxDQUFDMUwsS0FBeEMsRUEzQmQ7O0FBQUE7QUFBQTtBQUFBLG1CQTZCWXNMLGdFQUFhLENBQ2pCckYsT0FEaUIsRUFFakIsT0FGaUIsRUFHakJzRiwrREFBWSxDQUFDO0FBQ1gzSyxxQkFBTyxFQUFFZ08sU0FBUyxDQUFDdkksWUFEUjtBQUVYMUgsdUJBQVMsRUFBRTZGLHlFQUEyQixDQUFDN0YsU0FGNUI7QUFHWGtDLGtCQUFJLEVBQUU7QUFDSlgsc0JBQU0sRUFBRTBPLFNBQVMsQ0FBQzFPO0FBRGQ7QUFISyxhQUFELENBSEssQ0E3QnpCOztBQUFBO0FBQUE7QUFBQTs7QUFBQTtBQUFBLGtCQXlDWXFQLHNCQXpDWjs7QUFBQTtBQUFBO0FBQUE7O0FBQUE7QUFBQTtBQUFBO0FBNENJdEosbUJBQU8sQ0FBQ2lELEdBQVIsQ0FBWWxKLEtBQVosQ0FBa0IseUJBQWxCLGdCQUFvRDRPLFNBQXBELEVBNUNKLENBNkNJOztBQTdDSjtBQUFBLG1CQThDVXRELGdFQUFhLENBQ2pCckYsT0FEaUIsRUFFakIsT0FGaUIsRUFHakJzRiwrREFBWSxDQUFDO0FBQ1gzSyxxQkFBTyxFQUFFZ08sU0FBUyxDQUFDdkksWUFEUjtBQUVYMUgsdUJBQVMsRUFBRTZGLHlFQUEyQixDQUFDN0YsU0FGNUI7QUFHWGtDLGtCQUFJLEVBQUU7QUFDSlgsc0JBQU0sRUFBRTBPLFNBQVMsQ0FBQzFPLE1BRGQ7QUFFSkYscUJBQUs7QUFGRDtBQUhLLGFBQUQsQ0FISyxDQTlDdkI7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsRzs7OztTQW1FZWdMLFk7Ozs7Ozs7eUVBQWYsa0JBQTRCL0UsT0FBNUIsRUFBcUNwRixJQUFyQztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUVZMEIsa0JBRlosR0FFdUIxQixJQUZ2QixDQUVZMEIsTUFGWixFQUdJOztBQUNNa04sZ0JBSlYsR0FJaUJaLHNFQUFVLENBQ3JCdE0sTUFBTSxDQUFDdEQsUUFEYyxFQUVyQnNELE1BQU0sQ0FBQ3JELEtBRmMsRUFHckJxRCxNQUFNLENBQUNwRCxRQUhjLEVBSXJCb0QsTUFBTSxDQUFDbkQsU0FKYyxDQUozQixFQVVJOztBQVZKO0FBQUEsbUJBV29Dc1EsdUVBQWlCLENBQUN6SixPQUFELEVBQVV3SixJQUFWLENBWHJEOztBQUFBO0FBV1VFLDZCQVhWOztBQUFBLGdCQWFTQSxpQkFBaUIsQ0FBQ2hFLFNBYjNCO0FBQUE7QUFBQTtBQUFBOztBQUFBLGtCQWE0Q2dFLGlCQWI1Qzs7QUFBQTtBQWNJO0FBQ01DLG9CQWZWLEdBZXFCRCxpQkFBaUIsQ0FBQzlPLElBZnZDLEVBZ0JJOztBQUNNZ1AsMkJBakJWLEdBaUI0QkQsUUFBUSxDQUFDcEcsTUFBVCxDQUN0QixVQUFBNkUsT0FBTztBQUFBLHFCQUFJQSxPQUFPLENBQUNqRyxNQUFSLEtBQW1CN0MsdURBQXZCO0FBQUEsYUFEZSxDQWpCNUIsRUFvQkk7O0FBQ011Syx3QkFyQlYsR0FxQnlCRixRQUFRLENBQUNwRyxNQUFULENBQ25CLFVBQUE2RSxPQUFPO0FBQUEscUJBQUlBLE9BQU8sQ0FBQ2pHLE1BQVIsS0FBbUIzQyxvREFBdkI7QUFBQSxhQURZLENBckJ6QixFQXdCSTs7QUF4Qko7QUFBQSxtQkF5QjBDb0YsT0FBTyxDQUFDQyxHQUFSLENBQ3BDK0UsZUFBZSxDQUFDOUUsR0FBaEI7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLHFGQUFvQixrQkFBTTdFLEtBQU47QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSwrQkFDR2tJLHlEQUFPLENBQUNuSSxPQUFELEVBQVVDLEtBQVYsRUFBaUIzRCxNQUFqQixDQURWOztBQUFBO0FBQ1ptSiw4QkFEWTtBQUFBLDBEQUVYQSxNQUZXOztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLGVBQXBCOztBQUFBO0FBQUE7QUFBQTtBQUFBLGdCQURvQyxDQXpCMUM7O0FBQUE7QUF5QlVxRSxtQ0F6QlY7QUFBQTtBQUFBLG1CQWlDd0NsRixPQUFPLENBQUNDLEdBQVIsQ0FDbENnRixZQUFZLENBQUMvRSxHQUFiO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxxRkFBaUIsa0JBQU03RSxLQUFOO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUNUOEosd0NBRFMsa0ZBRVZ6TixNQUZVO0FBR2JyQyxnQ0FBTSxFQUFFZ0csS0FBSyxDQUFDaEc7QUFIRDtBQUFBO0FBQUEsK0JBS00rUCx3RUFBa0IsQ0FBQ2hLLE9BQUQsRUFBVStKLGdCQUFWLENBTHhCOztBQUFBO0FBS1R0RSw4QkFMUztBQUFBLDBEQU1SQSxNQU5ROztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLGVBQWpCOztBQUFBO0FBQUE7QUFBQTtBQUFBLGdCQURrQyxDQWpDeEM7O0FBQUE7QUFpQ1V3RSxpQ0FqQ1Y7QUE0Q0k7QUFDTUMsMkJBN0NWLEdBNkM0QkosdUJBQXVCLENBQzVDdkcsTUFEcUIsQ0FDZCxVQUFBa0MsTUFBTTtBQUFBLHFCQUFJQSxNQUFNLENBQUNDLFNBQVAsS0FBcUIsSUFBekI7QUFBQSxhQURRLEVBRXJCWixHQUZxQixDQUVqQixVQUFBVyxNQUFNO0FBQUEscUJBQUlBLE1BQU0sQ0FBQ3hMLE1BQVg7QUFBQSxhQUZXLENBN0M1QixFQWdESTs7QUFDTWtRLHlCQWpEVixHQWlEMEJMLHVCQUF1QixDQUMxQ3ZHLE1BRG1CLENBQ1osVUFBQWtDLE1BQU07QUFBQSxxQkFBSUEsTUFBTSxDQUFDQyxTQUFQLEtBQXFCLEtBQXpCO0FBQUEsYUFETSxFQUVuQlosR0FGbUIsQ0FFZixVQUFBVyxNQUFNO0FBQUEscUJBQUs7QUFBRXhMLHNCQUFNLEVBQUV3TCxNQUFNLENBQUN4TCxNQUFqQjtBQUF5QkYscUJBQUssRUFBRTBMLE1BQU0sQ0FBQzFMO0FBQXZDLGVBQUw7QUFBQSxhQUZTLENBakQxQixFQW9ESTtBQUNBOztBQUNNcVEsa0NBdERWLEdBc0RtQ0gscUJBQXFCLENBQ2pEMUcsTUFENEIsQ0FDckIsVUFBQWtDLE1BQU07QUFBQSxxQkFBSUEsTUFBTSxDQUFDQyxTQUFQLEtBQXFCLElBQXpCO0FBQUEsYUFEZSxFQUU1QlosR0FGNEIsQ0FFeEIsVUFBQVcsTUFBTTtBQUFBLHFCQUFJQSxNQUFNLENBQUN4TCxNQUFYO0FBQUEsYUFGa0IsQ0F0RG5DLEVBeURJOztBQUNNb1EsZ0NBMURWLEdBMERpQ0oscUJBQXFCLENBQy9DMUcsTUFEMEIsQ0FDbkIsVUFBQWtDLE1BQU07QUFBQSxxQkFBSUEsTUFBTSxDQUFDQyxTQUFQLEtBQXFCLEtBQXpCO0FBQUEsYUFEYSxFQUUxQlosR0FGMEIsQ0FFdEIsVUFBQVcsTUFBTTtBQUFBLHFCQUFLO0FBQUV4TCxzQkFBTSxFQUFFd0wsTUFBTSxDQUFDeEwsTUFBakI7QUFBeUJGLHFCQUFLLEVBQUUwTCxNQUFNLENBQUMxTDtBQUF2QyxlQUFMO0FBQUEsYUFGZ0IsQ0ExRGpDLEVBOERJOztBQTlESjtBQUFBLG1CQStEVXNMLGdFQUFhLENBQ2pCckYsT0FEaUIsRUFFakIsT0FGaUIsRUFHakJzRiwrREFBWSxDQUFDO0FBQ1gzSyxxQkFBTyxZQUFLMkIsTUFBTSxDQUFDdEQsUUFBWixjQUF3QnNELE1BQU0sQ0FBQ3JELEtBQS9CLGNBQXdDcUQsTUFBTSxDQUFDcEQsUUFBL0MsY0FDTG9ELE1BQU0sQ0FBQ25ELFNBREYsQ0FESTtBQUlYVCx1QkFBUyxFQUFFZ0IsbUVBQXFCLENBQUNoQixTQUp0QjtBQUtYa0Msa0JBQUksRUFBRTtBQUNKaEMsd0JBQVEsRUFBRTBELE1BQU0sQ0FBQzFELFFBRGI7QUFFSnNSLCtCQUFlLEVBQWZBLGVBRkk7QUFHSkMsNkJBQWEsRUFBYkEsYUFISTtBQUlKQyxzQ0FBc0IsRUFBdEJBLHNCQUpJO0FBS0pDLG9DQUFvQixFQUFwQkE7QUFMSTtBQUxLLGFBQUQsQ0FISyxDQS9EdkI7O0FBQUE7QUFBQTtBQUFBOztBQUFBO0FBQUE7QUFBQTtBQWlGSXJLLG1CQUFPLENBQUNpRCxHQUFSLENBQVlsSixLQUFaLENBQWtCLHNCQUFsQixnQkFBaURhLElBQWpELEVBakZKLENBa0ZJOztBQWxGSjtBQUFBLG1CQW1GVXlLLGdFQUFhLENBQ2pCckYsT0FEaUIsRUFFakIsS0FGaUIsRUFHakJzRiwrREFBWSxDQUFDO0FBQ1gzSyxxQkFBTyxFQUFFLFFBREU7QUFFWGpDLHVCQUFTLEVBQUUrQyxpRUFBbUIsQ0FBQy9DLFNBRnBCO0FBR1hrQyxrQkFBSSxFQUFFO0FBQ0poQyx3QkFBUSxFQUFFZ0MsSUFBSSxDQUFDMEIsTUFBTCxDQUFZN0IsRUFEbEI7QUFFSlYscUJBQUs7QUFGRDtBQUhLLGFBQUQsQ0FISyxDQW5GdkI7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsRzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUM3TUE7OztBQUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsU0FBU3VRLFlBQVQsQ0FBc0I5RyxHQUF0QixFQUEyQjtBQUN6QixTQUFPLElBQUkrRyxzREFBSixDQUFjLElBQUlDLG9EQUFXLENBQUNDLGdCQUFoQixDQUFpQ2pILEdBQWpDLENBQWQsQ0FBUDtBQUNEOztBQUVELFNBQVNrSCxPQUFULENBQWlCQyxRQUFqQixFQUEyQjtBQUN6QixTQUFPQywwQ0FBRyxDQUFDQyxLQUFKLENBQVVGLFFBQVYsRUFBb0IsSUFBcEIsRUFBMEJHLElBQWpDO0FBQ0Q7O0FBRUQsSUFBTUMsTUFBTSxHQUFHO0FBQ2JDLE9BQUssRUFBRTtBQUNMQyxVQUFNLEVBQUVYLFlBQVksQ0FBQ1ksT0FBTyxDQUFDQyxHQUFSLENBQVlDLFlBQVosSUFBNEJGLE9BQU8sQ0FBQ0MsR0FBUixDQUFZRSxXQUF6QyxDQURmO0FBRUxQLFFBQUksRUFBRUosT0FBTyxDQUFDUSxPQUFPLENBQUNDLEdBQVIsQ0FBWUcsaUJBQVosSUFBaUNKLE9BQU8sQ0FBQ0MsR0FBUixDQUFZSSxnQkFBOUM7QUFGUixHQURNO0FBS2I3RCxTQUFPLEVBQUU7QUFDUHVELFVBQU0sRUFBRVgsWUFBWSxDQUFDWSxPQUFPLENBQUNDLEdBQVIsQ0FBWUssY0FBWixJQUE4Qk4sT0FBTyxDQUFDQyxHQUFSLENBQVlFLFdBQTNDLENBRGI7QUFFUFAsUUFBSSxFQUFFSixPQUFPLENBQ1hRLE9BQU8sQ0FBQ0MsR0FBUixDQUFZTSxtQkFBWixJQUFtQ1AsT0FBTyxDQUFDQyxHQUFSLENBQVlJLGdCQURwQztBQUZOLEdBTEk7QUFXYkcsU0FBTyxFQUFFO0FBQ1BULFVBQU0sRUFBRVgsWUFBWSxDQUFDWSxPQUFPLENBQUNDLEdBQVIsQ0FBWVEsY0FBWixJQUE4QlQsT0FBTyxDQUFDQyxHQUFSLENBQVlFLFdBQTNDLENBRGI7QUFFUFAsUUFBSSxFQUFFSixPQUFPLENBQ1hRLE9BQU8sQ0FBQ0MsR0FBUixDQUFZUyxtQkFBWixJQUFtQ1YsT0FBTyxDQUFDQyxHQUFSLENBQVlJLGdCQURwQztBQUZOLEdBWEk7QUFpQmJ0SSxLQUFHLEVBQUU7QUFDSGdJLFVBQU0sRUFBRVgsWUFBWSxDQUFDWSxPQUFPLENBQUNDLEdBQVIsQ0FBWVUsVUFBWixJQUEwQlgsT0FBTyxDQUFDQyxHQUFSLENBQVlFLFdBQXZDLENBRGpCO0FBRUhQLFFBQUksRUFBRUosT0FBTyxDQUFDUSxPQUFPLENBQUNDLEdBQVIsQ0FBWVcsZUFBWixJQUErQlosT0FBTyxDQUFDQyxHQUFSLENBQVlJLGdCQUE1QztBQUZWO0FBakJRLENBQWY7O0FBdUJBLFNBQVNqRyxZQUFULENBQXNCcUQsU0FBdEIsRUFBaUM7QUFDL0IsTUFBTUosTUFBTSxHQUFHLEVBQWY7O0FBQ0EsTUFBTTNOLElBQUksR0FBRztBQUFFakIsV0FBTyxFQUFFd0YsMkRBQWVBO0FBQTdCLEtBQWtDd0osU0FBUyxDQUFDL04sSUFBNUMsQ0FBVjs7QUFDQSxNQUFNbVIsUUFBUSxHQUFHO0FBQ2Z0UixNQUFFLEVBQUU0TCwrQ0FBSSxFQURPO0FBRWZwTCxlQUFXLEVBQUUsS0FGRTtBQUdmSixhQUFTLEVBQUUsSUFBSXlMLElBQUosRUFISTtBQUlmM0wsV0FBTyxFQUFFZ08sU0FBUyxDQUFDaE8sT0FKSjtBQUtmakMsYUFBUyxFQUFFaVEsU0FBUyxDQUFDalEsU0FMTjtBQU1ma0MsUUFBSSxFQUFKQTtBQU5lLEdBQWpCO0FBUUEyTixRQUFNLENBQUMzQyxJQUFQLENBQVltRyxRQUFaO0FBQ0EsU0FBT3hELE1BQVA7QUFDRDs7U0FFY2xELGE7Ozs7Ozs7eUVBQWYsaUJBQTZCckYsT0FBN0IsRUFBc0N0RixLQUF0QyxFQUE2QzZOLE1BQTdDO0FBQUE7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLDRCQUU2QndDLE1BQU0sQ0FBQ3JRLEtBQUQsQ0FGbkMsRUFFWXVRLE1BRlosaUJBRVlBLE1BRlosRUFFb0JILElBRnBCLGlCQUVvQkEsSUFGcEI7QUFBQTtBQUFBLG1CQUdVRyxNQUFNLENBQUM1RixhQUFQLENBQXFCeUYsSUFBckIsRUFBMkJ2QyxNQUEzQixDQUhWOztBQUFBO0FBQUEsNkNBS1c7QUFBRTdDLHVCQUFTLEVBQUU7QUFBYixhQUxYOztBQUFBO0FBQUE7QUFBQTtBQU9JMUYsbUJBQU8sQ0FBQ2lELEdBQVIsQ0FBWWxKLEtBQVo7QUFQSiw2Q0FRVztBQUFFMkwsdUJBQVMsRUFBRSxLQUFiO0FBQW9CaEwsbUJBQUssRUFBTEEsS0FBcEI7QUFBMkI2TixvQkFBTSxFQUFOQSxNQUEzQjtBQUFtQ3hPLG1CQUFLO0FBQXhDLGFBUlg7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsRzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQ3ZEQTtBQU1BOztBQUVBLFNBQVNpUyxZQUFULENBQXNCaE0sT0FBdEIsRUFBK0JpTSxHQUEvQixFQUFvQztBQUNsQyxNQUFNQyxTQUFTLEdBQUdoSixJQUFJLENBQUMySCxLQUFMLENBQVdvQixHQUFHLENBQUNFLE9BQWYsQ0FBbEI7QUFDQW5NLFNBQU8sQ0FBQ2lELEdBQVIsQ0FBWW1DLElBQVosMkNBQ3FDbEMsSUFBSSxDQUFDQyxTQUFMLENBQWUrSSxTQUFmLENBRHJDLEdBRmtDLENBS2xDO0FBQ0E7O0FBQ0FBLFdBQVMsQ0FBQ3pJLE9BQVYsQ0FBa0IsVUFBQTJJLGNBQWMsRUFBSTtBQUNsQyxRQUFNekQsU0FBUyxHQUFHeUQsY0FBYyxDQUFDeFIsSUFBakM7QUFDQSxRQUFNd0YsWUFBWSxHQUFHZ00sY0FBYyxDQUFDelIsT0FBcEM7O0FBQ0EsWUFBUXlSLGNBQWMsQ0FBQzFULFNBQXZCO0FBQ0UsV0FBS3dDLGtFQUFvQixDQUFDeEMsU0FBMUI7QUFBcUM7QUFDbkNzSCxpQkFBTyxDQUFDaUQsR0FBUixDQUFZb0osSUFBWixrRUFFSTFELFNBQVMsQ0FBQzJELGNBRmQsc0JBR2NGLGNBQWMsQ0FBQzFSLEtBSDdCO0FBS0FzRixpQkFBTyxDQUFDdU0sR0FBUixHQUFjO0FBQ1pwSyxrQkFBTSxFQUFFLEdBREk7QUFFWnFLLGdCQUFJLEVBQUU7QUFDSkMsZ0NBQWtCLEVBQUU5RCxTQUFTLENBQUMyRDtBQUQxQixhQUZNO0FBS1pJLG1CQUFPLEVBQUU7QUFDUCw4QkFBZ0I7QUFEVDtBQUxHLFdBQWQ7QUFTQTtBQUNEOztBQUNELFdBQUt6Tyx1RUFBeUIsQ0FBQ3ZGLFNBQS9CO0FBQTBDO0FBQ3hDc0gsaUJBQU8sQ0FBQ2lELEdBQVIsQ0FBWW1DLElBQVosZUFDU2dILGNBQWMsQ0FBQzFULFNBRHhCLHlCQUNnRHdLLElBQUksQ0FBQ0MsU0FBTCxDQUM1Q3dGLFNBRDRDLENBRGhEO0FBS0FELG1GQUFXLENBQUMxSSxPQUFEO0FBQVlJLHdCQUFZLEVBQVpBO0FBQVosYUFBNkJ1SSxTQUE3QixFQUFYO0FBQ0E7QUFDRDs7QUFDRCxXQUFLeEssc0VBQXdCLENBQUN6RixTQUE5QjtBQUF5QztBQUN2Q3NILGlCQUFPLENBQUNpRCxHQUFSLENBQVltQyxJQUFaLGVBQ1NnSCxjQUFjLENBQUMxVCxTQUR4Qix5QkFDZ0R3SyxJQUFJLENBQUNDLFNBQUwsQ0FDNUN3RixTQUQ0QyxDQURoRDtBQUtBRSxrRkFBVSxDQUFDN0ksT0FBRDtBQUFZSSx3QkFBWSxFQUFaQTtBQUFaLGFBQTZCdUksU0FBN0IsRUFBVjtBQUNBO0FBQ0Q7O0FBQ0QsV0FBS3ZLLHdFQUEwQixDQUFDMUYsU0FBaEM7QUFBMkM7QUFDekNzSCxpQkFBTyxDQUFDaUQsR0FBUixDQUFZbUMsSUFBWixlQUNTZ0gsY0FBYyxDQUFDMVQsU0FEeEIseUJBQ2dEd0ssSUFBSSxDQUFDQyxTQUFMLENBQzVDd0YsU0FENEMsQ0FEaEQ7QUFLQVUsb0ZBQVksQ0FBQ3JKLE9BQUQ7QUFBWUksd0JBQVksRUFBWkE7QUFBWixhQUE2QnVJLFNBQTdCLEVBQVo7QUFDQTtBQUNEOztBQUNEO0FBQVM7QUFDUDNJLGlCQUFPLENBQUNpRCxHQUFSLENBQVlsSixLQUFaLCtCQUF5Q3FTLGNBQWMsQ0FBQzFULFNBQXhEO0FBQ0Q7QUEvQ0g7QUFpREQsR0FwREQ7QUFxREFzSCxTQUFPLENBQUN1TSxHQUFSLEdBQWM7QUFDWnBLLFVBQU0sRUFBRTtBQURJLEdBQWQ7QUFHQW5DLFNBQU8sQ0FBQzJNLElBQVI7QUFDRDs7QUFFY1gsMkVBQWYsRTs7Ozs7Ozs7Ozs7QUMxRUE7QUFDQTtBQUNBO0FBQ0E7OztBQUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGdCQUFnQjtBQUNoQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaUU7Ozs7Ozs7Ozs7O0FDeEJBLElBQU1ZLEdBQUcsR0FBRztBQUNWbEksTUFEVSxrQkFDSDtBQUNMLFNBQUttSSxLQUFMLEdBQWEsT0FBYjtBQUNBLFNBQUtDLE1BQUwsR0FBYyxLQUFLckksT0FBTCxDQUFhcUksTUFBM0I7QUFDQSxTQUFLckgsTUFBTCxHQUFjLEtBQWQ7QUFDQSxTQUFLc0gsR0FBTCxHQUFXLENBQVg7QUFDRCxHQU5TO0FBT1Y3SCxNQVBVLGtCQU9IO0FBQ0wsU0FBS2pDLEdBQUwsQ0FBUyxNQUFUO0FBQ0EsU0FBSzlHLEtBQUwsR0FBYSxLQUFLRyxNQUFMLENBQVloRCxLQUF6QixDQUZLLENBR0w7QUFDQTs7QUFDQSxRQUFJLEtBQUttTSxNQUFMLEtBQWdCLEtBQXBCLEVBQTJCLEtBQUtBLE1BQUwsR0FBYyxLQUFLdEosS0FBbkI7QUFFM0IsU0FBSzRRLEdBQUwsSUFBWSxDQUFaLENBUEssQ0FRTDs7QUFDQSxRQUFNQyxDQUFDLEdBQUcsS0FBSyxLQUFLRixNQUFMLEdBQWMsQ0FBbkIsQ0FBVixDQVRLLENBV0w7O0FBQ0EsUUFBTUcsQ0FBQyxHQUFHLEtBQUt4SCxNQUFmLENBWkssQ0FjTDs7QUFDQSxTQUFLQSxNQUFMLEdBQWMsS0FBS3RKLEtBQUwsR0FBYTZRLENBQWIsR0FBaUJDLENBQUMsSUFBSSxJQUFJRCxDQUFSLENBQWhDO0FBQ0EsU0FBSy9KLEdBQUwsQ0FBUyxLQUFLd0MsTUFBZDtBQUNEO0FBeEJTLENBQVo7QUEyQkF5SCxNQUFNLENBQUNDLE9BQVAsR0FBaUJQLEdBQWpCLEM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUMzQkE7QUFDQTs7QUFFQSxTQUFTUSxTQUFULENBQW1CQyxHQUFuQixFQUF3QjtBQUN0QixTQUFPLENBQUNDLEtBQUssQ0FBQ0MsT0FBTixDQUFjRixHQUFkLENBQUQsSUFBdUJBLEdBQUcsR0FBR0csVUFBVSxDQUFDSCxHQUFELENBQWhCLEdBQXdCLENBQXhCLElBQTZCLENBQTNEO0FBQ0Q7O0FBQ0QsSUFBTUksT0FBTyxHQUFHLEVBQWhCLEMsQ0FDQTs7U0FDZXRGLE87O0VBcUJmO0FBQ0E7Ozs7Ozt5RUF0QkEsaUJBQXVCdUYsTUFBdkI7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLG1CQUV5QkEsTUFBTSxDQUFDekosU0FBUCxDQUFpQkEsU0FBakIsQ0FDbkJ5SixNQUFNLENBQUNDLE1BRFksRUFFbkJELE1BQU0sQ0FBQ2pKLE9BRlksQ0FGekI7O0FBQUE7QUFFVWdCLGtCQUZWO0FBTVVtSSxtQkFOVixHQU1vQixFQU5wQjs7QUFPSSxpQkFBU0MsQ0FBVCxHQUFhLENBQWIsRUFBZ0JBLENBQUMsR0FBR0gsTUFBTSxDQUFDRSxPQUFQLENBQWVwRixNQUFuQyxFQUEyQ3FGLENBQUMsSUFBSSxDQUFoRCxFQUFtRDtBQUNqRCxrQkFBSVAsS0FBSyxDQUFDQyxPQUFOLENBQWM5SCxNQUFNLENBQUNvSSxDQUFELENBQXBCLENBQUosRUFBOEI7QUFDdEJDLG1CQURzQixHQUNoQnJJLE1BQU0sQ0FBQ29JLENBQUQsQ0FEVTtBQUU1QkQsdUJBQU8sQ0FBQ0YsTUFBTSxDQUFDRSxPQUFQLENBQWVDLENBQWYsQ0FBRCxDQUFQLEdBQTZCQyxHQUFHLENBQUNBLEdBQUcsQ0FBQ3RGLE1BQUosR0FBYSxDQUFkLENBQWhDO0FBQ0QsZUFIRCxNQUdPO0FBQ0xvRix1QkFBTyxDQUFDRixNQUFNLENBQUNFLE9BQVAsQ0FBZUMsQ0FBZixDQUFELENBQVAsR0FBNkJwSSxNQUFNLENBQUNvSSxDQUFELENBQW5DO0FBQ0Q7QUFDRjs7QUFkTCw2Q0FlV0QsT0FmWDs7QUFBQTtBQUFBO0FBQUE7QUFBQTs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxHOzs7O0FBdUJBLElBQU1HLFlBQVksR0FBRyxTQUFmQSxZQUFlLENBQUNDLFVBQUQsRUFBYU4sTUFBYixFQUF3QjtBQUMzQyxNQUFNTyxjQUFjLEdBQUdSLE9BQU8sQ0FBQ08sVUFBRCxDQUFQLENBQW9CRSxRQUEzQztBQUVBRCxnQkFBYyxDQUFDeEssT0FBZixDQUF1QixVQUFBMEssU0FBUyxFQUFJO0FBQ2xDLFFBQUksQ0FBQzlLLE1BQU0sQ0FBQytLLFNBQVAsQ0FBaUJDLGNBQWpCLENBQWdDQyxJQUFoQyxDQUFxQ1osTUFBckMsRUFBNkNTLFNBQTdDLENBQUwsRUFBOEQ7QUFDNUQsWUFBTSxJQUFJcEssS0FBSixpQ0FDcUJpSyxVQURyQix1QkFDNENHLFNBRDVDLE9BQU47QUFHRDs7QUFFRCxRQUFNSSxHQUFHLEdBQUdiLE1BQU0sQ0FBQ1MsU0FBRCxDQUFsQjs7QUFFQSxRQUFJLENBQUNmLFNBQVMsQ0FBQ21CLEdBQUQsQ0FBZCxFQUFxQjtBQUNuQixZQUFNLElBQUl4SyxLQUFKLGlDQUNxQmlLLFVBRHJCLGdCQUNxQ0csU0FEckMsMkJBQU47QUFHRDtBQUNGLEdBZEQ7QUFlRCxDQWxCRDs7QUFvQkFWLE9BQU8sQ0FBQ2UsRUFBUixHQUFhO0FBQ1hOLFVBQVEsRUFBRSxFQURDO0FBRVhPLFFBQU0sRUFBRSxnQkFBQWYsTUFBTSxFQUFJO0FBQ2hCSyxnQkFBWSxDQUFDLElBQUQsRUFBT0wsTUFBUCxDQUFaO0FBRUEsV0FBTyxVQUFBOVMsSUFBSTtBQUFBLGFBQ1R1TixPQUFPLENBQUM7QUFDTmxFLGlCQUFTLEVBQUV5Syw2Q0FBTSxDQUFDbk4sVUFBUCxDQUFrQmlOLEVBRHZCO0FBRU5iLGNBQU0sRUFBRSxDQUFDL1MsSUFBSSxDQUFDckIsSUFBTixFQUFZcUIsSUFBSSxDQUFDcEIsR0FBakIsRUFBc0JvQixJQUFJLENBQUN0QixLQUEzQixFQUFrQ3NCLElBQUksQ0FBQ25CLE1BQXZDLENBRkY7QUFHTmdMLGVBQU8sRUFBRSxFQUhIO0FBSU5tSixlQUFPLEVBQUUsQ0FBQyxRQUFEO0FBSkgsT0FBRCxDQURFO0FBQUEsS0FBWDtBQU9EO0FBWlUsQ0FBYjtBQWVBSCxPQUFPLENBQUNrQixLQUFSLEdBQWdCO0FBQ2RULFVBQVEsRUFBRSxDQUFDLGlCQUFELEVBQW9CLGlCQUFwQixDQURJO0FBRWRPLFFBQU0sRUFBRSxnQkFBQWYsTUFBTSxFQUFJO0FBQ2hCSyxnQkFBWSxDQUFDLE9BQUQsRUFBVUwsTUFBVixDQUFaO0FBRUEsV0FBTyxVQUFBOVMsSUFBSTtBQUFBLGFBQ1R1TixPQUFPLENBQUM7QUFDTmxFLGlCQUFTLEVBQUV5Syw2Q0FBTSxDQUFDbk4sVUFBUCxDQUFrQm9OLEtBRHZCO0FBRU5oQixjQUFNLEVBQUUsQ0FBQy9TLElBQUksQ0FBQ3JCLElBQU4sRUFBWXFCLElBQUksQ0FBQ3BCLEdBQWpCLEVBQXNCb0IsSUFBSSxDQUFDdEIsS0FBM0IsRUFBa0NzQixJQUFJLENBQUNuQixNQUF2QyxDQUZGO0FBR05nTCxlQUFPLEVBQUUsQ0FBQ2lKLE1BQU0sQ0FBQ2tCLGVBQVIsRUFBeUJsQixNQUFNLENBQUNtQixlQUFoQyxDQUhIO0FBSU5qQixlQUFPLEVBQUUsQ0FBQyxRQUFEO0FBSkgsT0FBRCxDQURFO0FBQUEsS0FBWDtBQU9EO0FBWmEsQ0FBaEI7QUFlQUgsT0FBTyxDQUFDcUIsR0FBUixHQUFjO0FBQ1paLFVBQVEsRUFBRSxDQUFDLGlCQUFELENBREU7QUFFWk8sUUFBTSxFQUFFLGdCQUFBZixNQUFNLEVBQUk7QUFDaEJLLGdCQUFZLENBQUMsS0FBRCxFQUFRTCxNQUFSLENBQVo7QUFFQSxXQUFPLFVBQUE5UyxJQUFJO0FBQUEsYUFDVHVOLE9BQU8sQ0FBQztBQUNObEUsaUJBQVMsRUFBRXlLLDZDQUFNLENBQUNuTixVQUFQLENBQWtCdU4sR0FEdkI7QUFFTm5CLGNBQU0sRUFBRSxDQUFDL1MsSUFBSSxDQUFDckIsSUFBTixFQUFZcUIsSUFBSSxDQUFDcEIsR0FBakIsRUFBc0JvQixJQUFJLENBQUN0QixLQUEzQixDQUZGO0FBR05tTCxlQUFPLEVBQUUsQ0FBQ2lKLE1BQU0sQ0FBQ3FCLGVBQVIsQ0FISDtBQUlObkIsZUFBTyxFQUFFLENBQUMsUUFBRDtBQUpILE9BQUQsQ0FERTtBQUFBLEtBQVg7QUFPRDtBQVpXLENBQWQ7QUFlQUgsT0FBTyxDQUFDdUIsSUFBUixHQUFlO0FBQ2JkLFVBQVEsRUFBRSxDQUFDLGlCQUFELENBREc7QUFFYk8sUUFBTSxFQUFFLGdCQUFBZixNQUFNLEVBQUk7QUFDaEJLLGdCQUFZLENBQUMsTUFBRCxFQUFTTCxNQUFULENBQVo7QUFFQSxXQUFPLFVBQUE5UyxJQUFJO0FBQUEsYUFDVHVOLE9BQU8sQ0FBQztBQUNObEUsaUJBQVMsRUFBRXlLLDZDQUFNLENBQUNuTixVQUFQLENBQWtCeU4sSUFEdkI7QUFFTnJCLGNBQU0sRUFBRSxDQUFDL1MsSUFBSSxDQUFDckIsSUFBTixFQUFZcUIsSUFBSSxDQUFDcEIsR0FBakIsRUFBc0JvQixJQUFJLENBQUN0QixLQUEzQixDQUZGO0FBR05tTCxlQUFPLEVBQUUsQ0FBQ2lKLE1BQU0sQ0FBQ3FCLGVBQVIsQ0FISDtBQUlObkIsZUFBTyxFQUFFLENBQUMsUUFBRDtBQUpILE9BQUQsQ0FERTtBQUFBLEtBQVg7QUFPRDtBQVpZLENBQWY7QUFlQUgsT0FBTyxDQUFDd0IsRUFBUixHQUFhO0FBQ1hmLFVBQVEsRUFBRSxFQURDO0FBRVhPLFFBQU0sRUFBRSxnQkFBQWYsTUFBTSxFQUFJO0FBQ2hCSyxnQkFBWSxDQUFDLElBQUQsRUFBT0wsTUFBUCxDQUFaO0FBRUEsV0FBTyxVQUFBOVMsSUFBSTtBQUFBLGFBQ1R1TixPQUFPLENBQUM7QUFDTmxFLGlCQUFTLEVBQUV5Syw2Q0FBTSxDQUFDbk4sVUFBUCxDQUFrQjBOLEVBRHZCO0FBRU50QixjQUFNLEVBQUUsQ0FBQy9TLElBQUksQ0FBQ3JCLElBQU4sRUFBWXFCLElBQUksQ0FBQ3BCLEdBQWpCLENBRkY7QUFHTmlMLGVBQU8sRUFBRSxFQUhIO0FBSU5tSixlQUFPLEVBQUUsQ0FBQyxRQUFEO0FBSkgsT0FBRCxDQURFO0FBQUEsS0FBWDtBQU9EO0FBWlUsQ0FBYjtBQWVBSCxPQUFPLENBQUN5QixHQUFSLEdBQWM7QUFDWmhCLFVBQVEsRUFBRSxDQUFDLGlCQUFELEVBQW9CLGlCQUFwQixDQURFO0FBRVpPLFFBQU0sRUFBRSxnQkFBQWYsTUFBTSxFQUFJO0FBQ2hCSyxnQkFBWSxDQUFDLEtBQUQsRUFBUUwsTUFBUixDQUFaO0FBRUEsV0FBTyxVQUFBOVMsSUFBSTtBQUFBLGFBQ1R1TixPQUFPLENBQUM7QUFDTmxFLGlCQUFTLEVBQUV5Syw2Q0FBTSxDQUFDbk4sVUFBUCxDQUFrQjJOLEdBRHZCO0FBRU52QixjQUFNLEVBQUUsQ0FBQy9TLElBQUksQ0FBQ3RCLEtBQU4sQ0FGRjtBQUdObUwsZUFBTyxFQUFFLENBQUNpSixNQUFNLENBQUNrQixlQUFSLEVBQXlCbEIsTUFBTSxDQUFDbUIsZUFBaEMsQ0FISDtBQUlOakIsZUFBTyxFQUFFLENBQUMsUUFBRDtBQUpILE9BQUQsQ0FERTtBQUFBLEtBQVg7QUFPRDtBQVpXLENBQWQ7QUFlQUgsT0FBTyxDQUFDMEIsS0FBUixHQUFnQjtBQUNkakIsVUFBUSxFQUFFLENBQUMsaUJBQUQsQ0FESTtBQUVkTyxRQUFNLEVBQUUsZ0JBQUFmLE1BQU0sRUFBSTtBQUNoQkssZ0JBQVksQ0FBQyxPQUFELEVBQVVMLE1BQVYsQ0FBWjtBQUVBLFdBQU8sVUFBQTlTLElBQUk7QUFBQSxhQUNUdU4sT0FBTyxDQUFDO0FBQ05sRSxpQkFBUyxFQUFFeUssNkNBQU0sQ0FBQ25OLFVBQVAsQ0FBa0I0TixLQUR2QjtBQUVOeEIsY0FBTSxFQUFFLENBQUMvUyxJQUFJLENBQUNyQixJQUFOLEVBQVlxQixJQUFJLENBQUNwQixHQUFqQixDQUZGO0FBR05pTCxlQUFPLEVBQUUsQ0FBQ2lKLE1BQU0sQ0FBQ3FCLGVBQVIsQ0FISDtBQUlObkIsZUFBTyxFQUFFLENBQUMsV0FBRCxFQUFjLFNBQWQ7QUFKSCxPQUFELENBREU7QUFBQSxLQUFYO0FBT0Q7QUFaYSxDQUFoQjtBQWVBSCxPQUFPLENBQUMyQixRQUFSLEdBQW1CO0FBQ2pCbEIsVUFBUSxFQUFFLENBQUMsaUJBQUQsQ0FETztBQUVqQk8sUUFBTSxFQUFFLGdCQUFBZixNQUFNLEVBQUk7QUFDaEJLLGdCQUFZLENBQUMsVUFBRCxFQUFhTCxNQUFiLENBQVo7QUFFQSxXQUFPLFVBQUE5UyxJQUFJO0FBQUEsYUFDVHVOLE9BQU8sQ0FBQztBQUNObEUsaUJBQVMsRUFBRXlLLDZDQUFNLENBQUNuTixVQUFQLENBQWtCNk4sUUFEdkI7QUFFTnpCLGNBQU0sRUFBRSxDQUFDL1MsSUFBSSxDQUFDckIsSUFBTixFQUFZcUIsSUFBSSxDQUFDcEIsR0FBakIsQ0FGRjtBQUdOaUwsZUFBTyxFQUFFLENBQUNpSixNQUFNLENBQUNxQixlQUFSLENBSEg7QUFJTm5CLGVBQU8sRUFBRSxDQUFDLFFBQUQ7QUFKSCxPQUFELENBREU7QUFBQSxLQUFYO0FBT0Q7QUFaZ0IsQ0FBbkI7QUFlQUgsT0FBTyxDQUFDNEIsR0FBUixHQUFjO0FBQ1puQixVQUFRLEVBQUUsQ0FBQyxpQkFBRCxDQURFO0FBRVpPLFFBQU0sRUFBRSxnQkFBQWYsTUFBTSxFQUFJO0FBQ2hCSyxnQkFBWSxDQUFDLEtBQUQsRUFBUUwsTUFBUixDQUFaO0FBRUEsV0FBTyxVQUFBOVMsSUFBSTtBQUFBLGFBQ1R1TixPQUFPLENBQUM7QUFDTmxFLGlCQUFTLEVBQUV5Syw2Q0FBTSxDQUFDbk4sVUFBUCxDQUFrQjhOLEdBRHZCO0FBRU4xQixjQUFNLEVBQUUsQ0FBQy9TLElBQUksQ0FBQ3JCLElBQU4sRUFBWXFCLElBQUksQ0FBQ3BCLEdBQWpCLEVBQXNCb0IsSUFBSSxDQUFDdEIsS0FBM0IsQ0FGRjtBQUdObUwsZUFBTyxFQUFFLENBQUNpSixNQUFNLENBQUNxQixlQUFSLENBSEg7QUFJTm5CLGVBQU8sRUFBRSxDQUFDLFFBQUQ7QUFKSCxPQUFELENBREU7QUFBQSxLQUFYO0FBT0Q7QUFaVyxDQUFkO0FBZUFILE9BQU8sQ0FBQzZCLFFBQVIsR0FBbUI7QUFDakJwQixVQUFRLEVBQUUsRUFETztBQUVqQk8sUUFBTSxFQUFFLGdCQUFBZixNQUFNLEVBQUk7QUFDaEJLLGdCQUFZLENBQUMsVUFBRCxFQUFhTCxNQUFiLENBQVo7QUFFQSxXQUFPLFVBQUE5UyxJQUFJO0FBQUEsYUFDVHVOLE9BQU8sQ0FBQztBQUNObEUsaUJBQVMsRUFBRXlLLDZDQUFNLENBQUNuTixVQUFQLENBQWtCK04sUUFEdkI7QUFFTjNCLGNBQU0sRUFBRSxDQUFDL1MsSUFBSSxDQUFDdkIsSUFBTixFQUFZdUIsSUFBSSxDQUFDckIsSUFBakIsRUFBdUJxQixJQUFJLENBQUNwQixHQUE1QixFQUFpQ29CLElBQUksQ0FBQ3RCLEtBQXRDLENBRkY7QUFHTm1MLGVBQU8sRUFBRSxFQUhIO0FBSU5tSixlQUFPLEVBQUUsQ0FBQyxRQUFEO0FBSkgsT0FBRCxDQURFO0FBQUEsS0FBWDtBQU9EO0FBWmdCLENBQW5CO0FBZUFILE9BQU8sQ0FBQzhCLE1BQVIsR0FBaUI7QUFDZnJCLFVBQVEsRUFBRSxDQUFDLGlCQUFELEVBQW9CLGdCQUFwQixDQURLO0FBRWZPLFFBQU0sRUFBRSxnQkFBQWYsTUFBTSxFQUFJO0FBQ2hCSyxnQkFBWSxDQUFDLFFBQUQsRUFBV0wsTUFBWCxDQUFaO0FBRUEsV0FBTyxVQUFBOVMsSUFBSTtBQUFBLGFBQ1R1TixPQUFPLENBQUM7QUFDTmxFLGlCQUFTLEVBQUV5Syw2Q0FBTSxDQUFDbk4sVUFBUCxDQUFrQmdPLE1BRHZCO0FBRU41QixjQUFNLEVBQUUsQ0FBQy9TLElBQUksQ0FBQ3RCLEtBQU4sQ0FGRjtBQUdObUwsZUFBTyxFQUFFLENBQUNpSixNQUFNLENBQUNxQixlQUFSLEVBQXlCckIsTUFBTSxDQUFDOEIsY0FBaEMsQ0FISDtBQUlONUIsZUFBTyxFQUFFLENBQUMsYUFBRCxFQUFnQixjQUFoQixFQUFnQyxhQUFoQztBQUpILE9BQUQsQ0FERTtBQUFBLEtBQVg7QUFPRDtBQVpjLENBQWpCO0FBZUFILE9BQU8sQ0FBQ2dDLEdBQVIsR0FBYztBQUNadkIsVUFBUSxFQUFFLEVBREU7QUFFWk8sUUFBTSxFQUFFLGdCQUFBZixNQUFNLEVBQUk7QUFDaEJLLGdCQUFZLENBQUMsS0FBRCxFQUFRTCxNQUFSLENBQVo7QUFFQSxXQUFPLFVBQUE5UyxJQUFJO0FBQUEsYUFDVHVOLE9BQU8sQ0FBQztBQUNObEUsaUJBQVMsRUFBRXlLLDZDQUFNLENBQUNuTixVQUFQLENBQWtCa08sR0FEdkI7QUFFTjlCLGNBQU0sRUFBRSxDQUFDL1MsSUFBSSxDQUFDdkIsSUFBTixFQUFZdUIsSUFBSSxDQUFDckIsSUFBakIsRUFBdUJxQixJQUFJLENBQUNwQixHQUE1QixFQUFpQ29CLElBQUksQ0FBQ3RCLEtBQXRDLENBRkY7QUFHTm1MLGVBQU8sRUFBRSxFQUhIO0FBSU5tSixlQUFPLEVBQUUsQ0FBQyxRQUFEO0FBSkgsT0FBRCxDQURFO0FBQUEsS0FBWDtBQU9EO0FBWlcsQ0FBZDtBQWVBSCxPQUFPLENBQUNpQyxHQUFSLEdBQWM7QUFDWnhCLFVBQVEsRUFBRSxDQUFDLGlCQUFELENBREU7QUFFWk8sUUFBTSxFQUFFLGdCQUFBZixNQUFNLEVBQUk7QUFDaEJLLGdCQUFZLENBQUMsS0FBRCxFQUFRTCxNQUFSLENBQVo7QUFFQSxXQUFPLFVBQUE5UyxJQUFJO0FBQUEsYUFDVHVOLE9BQU8sQ0FBQztBQUNObEUsaUJBQVMsRUFBRXlLLDZDQUFNLENBQUNuTixVQUFQLENBQWtCbU8sR0FEdkI7QUFFTi9CLGNBQU0sRUFBRSxDQUFDL1MsSUFBSSxDQUFDckIsSUFBTixFQUFZcUIsSUFBSSxDQUFDcEIsR0FBakIsRUFBc0JvQixJQUFJLENBQUN0QixLQUEzQixDQUZGO0FBR05tTCxlQUFPLEVBQUUsQ0FBQ2lKLE1BQU0sQ0FBQ3FCLGVBQVIsQ0FISDtBQUlObkIsZUFBTyxFQUFFLENBQUMsUUFBRDtBQUpILE9BQUQsQ0FERTtBQUFBLEtBQVg7QUFPRDtBQVpXLENBQWQ7QUFlQUgsT0FBTyxDQUFDa0MsR0FBUixHQUFjO0FBQ1p6QixVQUFRLEVBQUUsQ0FBQyxpQkFBRCxDQURFO0FBRVpPLFFBQU0sRUFBRSxnQkFBQWYsTUFBTSxFQUFJO0FBQ2hCSyxnQkFBWSxDQUFDLEtBQUQsRUFBUUwsTUFBUixDQUFaO0FBRUEsV0FBTyxVQUFBOVMsSUFBSTtBQUFBLGFBQ1R1TixPQUFPLENBQUM7QUFDTmxFLGlCQUFTLEVBQUV5Syw2Q0FBTSxDQUFDbk4sVUFBUCxDQUFrQm9PLEdBRHZCO0FBRU5oQyxjQUFNLEVBQUUsQ0FBQy9TLElBQUksQ0FBQ3RCLEtBQU4sQ0FGRjtBQUdObUwsZUFBTyxFQUFFLENBQUNpSixNQUFNLENBQUNxQixlQUFSLENBSEg7QUFJTm5CLGVBQU8sRUFBRSxDQUFDLFFBQUQ7QUFKSCxPQUFELENBREU7QUFBQSxLQUFYO0FBT0Q7QUFaVyxDQUFkO0FBZUFILE9BQU8sQ0FBQ21DLEdBQVIsR0FBYztBQUNaMUIsVUFBUSxFQUFFLENBQUMsaUJBQUQsQ0FERTtBQUVaTyxRQUFNLEVBQUUsZ0JBQUFmLE1BQU0sRUFBSTtBQUNoQkssZ0JBQVksQ0FBQyxLQUFELEVBQVFMLE1BQVIsQ0FBWjtBQUVBLFdBQU8sVUFBQTlTLElBQUk7QUFBQSxhQUNUdU4sT0FBTyxDQUFDO0FBQ05sRSxpQkFBUyxFQUFFeUssNkNBQU0sQ0FBQ25OLFVBQVAsQ0FBa0JxTyxHQUR2QjtBQUVOakMsY0FBTSxFQUFFLENBQUMvUyxJQUFJLENBQUNyQixJQUFOLEVBQVlxQixJQUFJLENBQUNwQixHQUFqQixDQUZGO0FBR05pTCxlQUFPLEVBQUUsQ0FBQ2lKLE1BQU0sQ0FBQ3FCLGVBQVIsQ0FISDtBQUlObkIsZUFBTyxFQUFFLENBQUMsUUFBRDtBQUpILE9BQUQsQ0FERTtBQUFBLEtBQVg7QUFPRDtBQVpXLENBQWQ7QUFlQUgsT0FBTyxDQUFDb0MsSUFBUixHQUFlO0FBQ2IzQixVQUFRLEVBQUUsQ0FBQyxpQkFBRCxDQURHO0FBRWJPLFFBQU0sRUFBRSxnQkFBQWYsTUFBTSxFQUFJO0FBQ2hCSyxnQkFBWSxDQUFDLE1BQUQsRUFBU0wsTUFBVCxDQUFaO0FBRUEsV0FBTyxVQUFBOVMsSUFBSTtBQUFBLGFBQ1R1TixPQUFPLENBQUM7QUFDTmxFLGlCQUFTLEVBQUV5Syw2Q0FBTSxDQUFDbk4sVUFBUCxDQUFrQnNPLElBRHZCO0FBRU5sQyxjQUFNLEVBQUUsQ0FBQy9TLElBQUksQ0FBQ3RCLEtBQU4sQ0FGRjtBQUdObUwsZUFBTyxFQUFFLENBQUNpSixNQUFNLENBQUNxQixlQUFSLENBSEg7QUFJTm5CLGVBQU8sRUFBRSxDQUFDLFFBQUQ7QUFKSCxPQUFELENBREU7QUFBQSxLQUFYO0FBT0Q7QUFaWSxDQUFmO0FBZUFILE9BQU8sQ0FBQ3FDLEVBQVIsR0FBYTtBQUNYNUIsVUFBUSxFQUFFLENBQUMsaUJBQUQsQ0FEQztBQUVYTyxRQUFNLEVBQUUsZ0JBQUFmLE1BQU0sRUFBSTtBQUNoQkssZ0JBQVksQ0FBQyxJQUFELEVBQU9MLE1BQVAsQ0FBWjtBQUVBLFdBQU8sVUFBQTlTLElBQUk7QUFBQSxhQUNUdU4sT0FBTyxDQUFDO0FBQ05sRSxpQkFBUyxFQUFFeUssNkNBQU0sQ0FBQ25OLFVBQVAsQ0FBa0J1TyxFQUR2QjtBQUVObkMsY0FBTSxFQUFFLENBQUMvUyxJQUFJLENBQUNyQixJQUFOLEVBQVlxQixJQUFJLENBQUNwQixHQUFqQixFQUFzQm9CLElBQUksQ0FBQ3RCLEtBQTNCLENBRkY7QUFHTm1MLGVBQU8sRUFBRSxDQUFDaUosTUFBTSxDQUFDcUIsZUFBUixDQUhIO0FBSU5uQixlQUFPLEVBQUUsQ0FBQyxRQUFELEVBQVcsU0FBWDtBQUpILE9BQUQsQ0FERTtBQUFBLEtBQVg7QUFPRDtBQVpVLENBQWI7QUFlQUgsT0FBTyxDQUFDc0MsRUFBUixHQUFhO0FBQ1g3QixVQUFRLEVBQUUsQ0FBQyxpQkFBRCxDQURDO0FBRVhPLFFBQU0sRUFBRSxnQkFBQWYsTUFBTSxFQUFJO0FBQ2hCSyxnQkFBWSxDQUFDLElBQUQsRUFBT0wsTUFBUCxDQUFaO0FBRUEsV0FBTyxVQUFBOVMsSUFBSTtBQUFBLGFBQ1R1TixPQUFPLENBQUM7QUFDTmxFLGlCQUFTLEVBQUV5Syw2Q0FBTSxDQUFDbk4sVUFBUCxDQUFrQndPLEVBRHZCO0FBRU5wQyxjQUFNLEVBQUUsQ0FBQy9TLElBQUksQ0FBQ3JCLElBQU4sRUFBWXFCLElBQUksQ0FBQ3BCLEdBQWpCLENBRkY7QUFHTmlMLGVBQU8sRUFBRSxDQUFDaUosTUFBTSxDQUFDcUIsZUFBUixDQUhIO0FBSU5uQixlQUFPLEVBQUUsQ0FBQyxRQUFELEVBQVcsT0FBWDtBQUpILE9BQUQsQ0FERTtBQUFBLEtBQVg7QUFPRDtBQVpVLENBQWI7QUFlQUgsT0FBTyxDQUFDdUMsR0FBUixHQUFjO0FBQ1o5QixVQUFRLEVBQUUsQ0FBQyxpQkFBRCxDQURFO0FBRVpPLFFBQU0sRUFBRSxnQkFBQWYsTUFBTSxFQUFJO0FBQ2hCSyxnQkFBWSxDQUFDLEtBQUQsRUFBUUwsTUFBUixDQUFaO0FBRUEsV0FBTyxVQUFBOVMsSUFBSTtBQUFBLGFBQ1R1TixPQUFPLENBQUM7QUFDTmxFLGlCQUFTLEVBQUV5Syw2Q0FBTSxDQUFDbk4sVUFBUCxDQUFrQnlPLEdBRHZCO0FBRU5yQyxjQUFNLEVBQUUsQ0FBQy9TLElBQUksQ0FBQ3RCLEtBQU4sQ0FGRjtBQUdObUwsZUFBTyxFQUFFLENBQUNpSixNQUFNLENBQUNxQixlQUFSLENBSEg7QUFJTm5CLGVBQU8sRUFBRSxDQUFDLFFBQUQ7QUFKSCxPQUFELENBREU7QUFBQSxLQUFYO0FBT0Q7QUFaVyxDQUFkO0FBZUFILE9BQU8sQ0FBQ3dDLEVBQVIsR0FBYTtBQUNYL0IsVUFBUSxFQUFFLENBQUMsaUJBQUQsQ0FEQztBQUVYTyxRQUFNLEVBQUUsZ0JBQUFmLE1BQU0sRUFBSTtBQUNoQkssZ0JBQVksQ0FBQyxJQUFELEVBQU9MLE1BQVAsQ0FBWjtBQUVBLFdBQU8sVUFBQTlTLElBQUk7QUFBQSxhQUNUdU4sT0FBTyxDQUFDO0FBQ05sRSxpQkFBUyxFQUFFeUssNkNBQU0sQ0FBQ25OLFVBQVAsQ0FBa0IwTyxFQUR2QjtBQUVOdEMsY0FBTSxFQUFFLENBQUMvUyxJQUFJLENBQUNyQixJQUFOLEVBQVlxQixJQUFJLENBQUNwQixHQUFqQixFQUFzQm9CLElBQUksQ0FBQ3RCLEtBQTNCLENBRkY7QUFHTm1MLGVBQU8sRUFBRSxDQUFDaUosTUFBTSxDQUFDcUIsZUFBUixDQUhIO0FBSU5uQixlQUFPLEVBQUUsQ0FBQyxRQUFEO0FBSkgsT0FBRCxDQURFO0FBQUEsS0FBWDtBQU9EO0FBWlUsQ0FBYjtBQWVBSCxPQUFPLENBQUN5QyxHQUFSLEdBQWM7QUFDWmhDLFVBQVEsRUFBRSxDQUFDLGlCQUFELENBREU7QUFFWk8sUUFBTSxFQUFFLGdCQUFBZixNQUFNLEVBQUk7QUFDaEJLLGdCQUFZLENBQUMsS0FBRCxFQUFRTCxNQUFSLENBQVo7QUFFQSxXQUFPLFVBQUE5UyxJQUFJO0FBQUEsYUFDVHVOLE9BQU8sQ0FBQztBQUNObEUsaUJBQVMsRUFBRXlLLDZDQUFNLENBQUNuTixVQUFQLENBQWtCMk8sR0FEdkI7QUFFTnZDLGNBQU0sRUFBRSxDQUFDL1MsSUFBSSxDQUFDdEIsS0FBTixDQUZGO0FBR05tTCxlQUFPLEVBQUUsQ0FBQ2lKLE1BQU0sQ0FBQ3FCLGVBQVIsQ0FISDtBQUlObkIsZUFBTyxFQUFFLENBQUMsUUFBRDtBQUpILE9BQUQsQ0FERTtBQUFBLEtBQVg7QUFPRDtBQVpXLENBQWQ7QUFlQUgsT0FBTyxDQUFDMEMsR0FBUixHQUFjO0FBQ1pqQyxVQUFRLEVBQUUsRUFERTtBQUVaTyxRQUFNLEVBQUUsZ0JBQUFmLE1BQU0sRUFBSTtBQUNoQkssZ0JBQVksQ0FBQyxLQUFELEVBQVFMLE1BQVIsQ0FBWjtBQUVBLFdBQU8sVUFBQTlTLElBQUk7QUFBQSxhQUNUdU4sT0FBTyxDQUFDO0FBQ05sRSxpQkFBUyxFQUFFeUssNkNBQU0sQ0FBQ25OLFVBQVAsQ0FBa0I0TyxHQUR2QjtBQUVOeEMsY0FBTSxFQUFFLENBQUMvUyxJQUFJLENBQUNyQixJQUFOLEVBQVlxQixJQUFJLENBQUNwQixHQUFqQixFQUFzQm9CLElBQUksQ0FBQ25CLE1BQTNCLENBRkY7QUFHTmdMLGVBQU8sRUFBRSxDQUFDaUosTUFBTSxDQUFDcUIsZUFBUixDQUhIO0FBSU5uQixlQUFPLEVBQUU7QUFKSCxPQUFELENBREU7QUFBQSxLQUFYO0FBT0Q7QUFaVyxDQUFkO0FBZUFILE9BQU8sQ0FBQzJDLE1BQVIsR0FBaUI7QUFDZmxDLFVBQVEsRUFBRSxDQUFDLGlCQUFELENBREs7QUFFZk8sUUFBTSxFQUFFLGdCQUFBZixNQUFNLEVBQUk7QUFDaEJLLGdCQUFZLENBQUMsUUFBRCxFQUFXTCxNQUFYLENBQVo7QUFFQSxXQUFPLFVBQUE5UyxJQUFJO0FBQUEsYUFDVHVOLE9BQU8sQ0FBQztBQUNObEUsaUJBQVMsRUFBRXlLLDZDQUFNLENBQUNuTixVQUFQLENBQWtCNk8sTUFEdkI7QUFFTnpDLGNBQU0sRUFBRSxDQUFDL1MsSUFBSSxDQUFDckIsSUFBTixFQUFZcUIsSUFBSSxDQUFDcEIsR0FBakIsQ0FGRjtBQUdOaUwsZUFBTyxFQUFFLENBQUNpSixNQUFNLENBQUNxQixlQUFSLENBSEg7QUFJTm5CLGVBQU8sRUFBRSxDQUFDLFFBQUQsRUFBVyxjQUFYO0FBSkgsT0FBRCxDQURFO0FBQUEsS0FBWDtBQU9EO0FBWmMsQ0FBakI7QUFlQUgsT0FBTyxDQUFDNEMsSUFBUixHQUFlO0FBQ2JuQyxVQUFRLEVBQUUsQ0FBQyxpQkFBRCxDQURHO0FBRWJPLFFBQU0sRUFBRSxnQkFBQWYsTUFBTSxFQUFJO0FBQ2hCSyxnQkFBWSxDQUFDLE1BQUQsRUFBU0wsTUFBVCxDQUFaO0FBRUEsV0FBTyxVQUFBOVMsSUFBSTtBQUFBLGFBQ1R1TixPQUFPLENBQUM7QUFDTmxFLGlCQUFTLEVBQUV5Syw2Q0FBTSxDQUFDbk4sVUFBUCxDQUFrQjhPLElBRHZCO0FBRU4xQyxjQUFNLEVBQUUsQ0FBQy9TLElBQUksQ0FBQ3RCLEtBQU4sQ0FGRjtBQUdObUwsZUFBTyxFQUFFLENBQUNpSixNQUFNLENBQUNxQixlQUFSLENBSEg7QUFJTm5CLGVBQU8sRUFBRSxDQUFDLFFBQUQ7QUFKSCxPQUFELENBREU7QUFBQSxLQUFYO0FBT0Q7QUFaWSxDQUFmO0FBZUFILE9BQU8sQ0FBQzZDLEdBQVIsR0FBYztBQUNacEMsVUFBUSxFQUFFLENBQUMsaUJBQUQsQ0FERTtBQUVaTyxRQUFNLEVBQUUsZ0JBQUFmLE1BQU0sRUFBSTtBQUNoQkssZ0JBQVksQ0FBQyxLQUFELEVBQVFMLE1BQVIsQ0FBWjtBQUVBLFdBQU8sVUFBQTlTLElBQUk7QUFBQSxhQUNUdU4sT0FBTyxDQUFDO0FBQ05sRSxpQkFBUyxFQUFFeUssNkNBQU0sQ0FBQ25OLFVBQVAsQ0FBa0IrTyxHQUR2QjtBQUVOM0MsY0FBTSxFQUFFLENBQUMvUyxJQUFJLENBQUN0QixLQUFOLENBRkY7QUFHTm1MLGVBQU8sRUFBRSxDQUFDaUosTUFBTSxDQUFDcUIsZUFBUixDQUhIO0FBSU5uQixlQUFPLEVBQUUsQ0FBQyxRQUFEO0FBSkgsT0FBRCxDQURFO0FBQUEsS0FBWDtBQU9EO0FBWlcsQ0FBZDtBQWVBSCxPQUFPLENBQUM4QyxJQUFSLEdBQWU7QUFDYnJDLFVBQVEsRUFBRSxDQUFDLGlCQUFELENBREc7QUFFYk8sUUFBTSxFQUFFLGdCQUFBZixNQUFNLEVBQUk7QUFDaEJLLGdCQUFZLENBQUMsTUFBRCxFQUFTTCxNQUFULENBQVo7QUFFQSxXQUFPLFVBQUE5UyxJQUFJO0FBQUEsYUFDVHVOLE9BQU8sQ0FBQztBQUNObEUsaUJBQVMsRUFBRXlLLDZDQUFNLENBQUNuTixVQUFQLENBQWtCZ1AsSUFEdkI7QUFFTjVDLGNBQU0sRUFBRSxDQUFDL1MsSUFBSSxDQUFDdEIsS0FBTixDQUZGO0FBR05tTCxlQUFPLEVBQUUsQ0FBQ2lKLE1BQU0sQ0FBQ3FCLGVBQVIsQ0FISDtBQUlObkIsZUFBTyxFQUFFLENBQUMsUUFBRDtBQUpILE9BQUQsQ0FERTtBQUFBLEtBQVg7QUFPRDtBQVpZLENBQWY7QUFlQUgsT0FBTyxDQUFDK0MsR0FBUixHQUFjO0FBQ1p0QyxVQUFRLEVBQUUsQ0FBQyxpQkFBRCxFQUFvQixpQkFBcEIsQ0FERTtBQUVaTyxRQUFNLEVBQUUsZ0JBQUFmLE1BQU0sRUFBSTtBQUNoQkssZ0JBQVksQ0FBQyxLQUFELEVBQVFMLE1BQVIsQ0FBWjtBQUVBLFdBQU8sVUFBQTlTLElBQUk7QUFBQSxhQUNUdU4sT0FBTyxDQUFDO0FBQ05sRSxpQkFBUyxFQUFFeUssNkNBQU0sQ0FBQ25OLFVBQVAsQ0FBa0JpUCxHQUR2QjtBQUVON0MsY0FBTSxFQUFFLENBQUMvUyxJQUFJLENBQUNyQixJQUFOLEVBQVlxQixJQUFJLENBQUNwQixHQUFqQixFQUFzQm9CLElBQUksQ0FBQ3RCLEtBQTNCLEVBQWtDc0IsSUFBSSxDQUFDbkIsTUFBdkMsQ0FGRjtBQUdOZ0wsZUFBTyxFQUFFLENBQUNpSixNQUFNLENBQUNrQixlQUFSLEVBQXlCbEIsTUFBTSxDQUFDbUIsZUFBaEMsQ0FISDtBQUlOakIsZUFBTyxFQUFFLENBQUMsUUFBRDtBQUpILE9BQUQsQ0FERTtBQUFBLEtBQVg7QUFPRDtBQVpXLENBQWQ7QUFlQUgsT0FBTyxDQUFDZ0QsTUFBUixHQUFpQjtBQUNmdkMsVUFBUSxFQUFFLENBQUMsaUJBQUQsQ0FESztBQUVmTyxRQUFNLEVBQUUsZ0JBQUFmLE1BQU0sRUFBSTtBQUNoQkssZ0JBQVksQ0FBQyxRQUFELEVBQVdMLE1BQVgsQ0FBWjtBQUVBLFdBQU8sVUFBQTlTLElBQUk7QUFBQSxhQUNUdU4sT0FBTyxDQUFDO0FBQ05sRSxpQkFBUyxFQUFFeUssNkNBQU0sQ0FBQ25OLFVBQVAsQ0FBa0JrUCxNQUR2QjtBQUVOOUMsY0FBTSxFQUFFLENBQUMvUyxJQUFJLENBQUN0QixLQUFOLENBRkY7QUFHTm1MLGVBQU8sRUFBRSxDQUFDaUosTUFBTSxDQUFDcUIsZUFBUixDQUhIO0FBSU5uQixlQUFPLEVBQUUsQ0FBQyxRQUFEO0FBSkgsT0FBRCxDQURFO0FBQUEsS0FBWDtBQU9EO0FBWmMsQ0FBakI7QUFlQUgsT0FBTyxDQUFDaUQsZUFBUixHQUEwQjtBQUN4QnhDLFVBQVEsRUFBRSxDQUFDLGlCQUFELENBRGM7QUFFeEJPLFFBQU0sRUFBRSxnQkFBQWYsTUFBTSxFQUFJO0FBQ2hCSyxnQkFBWSxDQUFDLGlCQUFELEVBQW9CTCxNQUFwQixDQUFaO0FBRUEsV0FBTyxVQUFBOVMsSUFBSTtBQUFBLGFBQ1R1TixPQUFPLENBQUM7QUFDTmxFLGlCQUFTLEVBQUV5Syw2Q0FBTSxDQUFDbk4sVUFBUCxDQUFrQm1QLGVBRHZCO0FBRU4vQyxjQUFNLEVBQUUsQ0FBQy9TLElBQUksQ0FBQ3RCLEtBQU4sQ0FGRjtBQUdObUwsZUFBTyxFQUFFLENBQUNpSixNQUFNLENBQUNxQixlQUFSLENBSEg7QUFJTm5CLGVBQU8sRUFBRSxDQUFDLFFBQUQ7QUFKSCxPQUFELENBREU7QUFBQSxLQUFYO0FBT0Q7QUFadUIsQ0FBMUI7QUFlQUgsT0FBTyxDQUFDa0QsV0FBUixHQUFzQjtBQUNwQnpDLFVBQVEsRUFBRSxDQUFDLGlCQUFELENBRFU7QUFFcEJPLFFBQU0sRUFBRSxnQkFBQWYsTUFBTSxFQUFJO0FBQ2hCSyxnQkFBWSxDQUFDLGFBQUQsRUFBZ0JMLE1BQWhCLENBQVo7QUFFQSxXQUFPLFVBQUE5UyxJQUFJO0FBQUEsYUFDVHVOLE9BQU8sQ0FBQztBQUNObEUsaUJBQVMsRUFBRXlLLDZDQUFNLENBQUNuTixVQUFQLENBQWtCb1AsV0FEdkI7QUFFTmhELGNBQU0sRUFBRSxDQUFDL1MsSUFBSSxDQUFDdEIsS0FBTixDQUZGO0FBR05tTCxlQUFPLEVBQUUsQ0FBQ2lKLE1BQU0sQ0FBQ3FCLGVBQVIsQ0FISDtBQUlObkIsZUFBTyxFQUFFLENBQUMsUUFBRDtBQUpILE9BQUQsQ0FERTtBQUFBLEtBQVg7QUFPRDtBQVptQixDQUF0QjtBQWVBSCxPQUFPLENBQUNtRCxJQUFSLEdBQWU7QUFDYjFDLFVBQVEsRUFBRSxDQUFDLGlCQUFELEVBQW9CLGlCQUFwQixFQUF1QyxtQkFBdkMsQ0FERztBQUViTyxRQUFNLEVBQUUsZ0JBQUFmLE1BQU0sRUFBSTtBQUNoQkssZ0JBQVksQ0FBQyxNQUFELEVBQVNMLE1BQVQsQ0FBWjtBQUVBLFdBQU8sVUFBQTlTLElBQUk7QUFBQSxhQUNUdU4sT0FBTyxDQUFDO0FBQ05sRSxpQkFBUyxFQUFFeUssNkNBQU0sQ0FBQ25OLFVBQVAsQ0FBa0JxUCxJQUR2QjtBQUVOakQsY0FBTSxFQUFFLENBQUMvUyxJQUFJLENBQUN0QixLQUFOLENBRkY7QUFHTm1MLGVBQU8sRUFBRSxDQUNQaUosTUFBTSxDQUFDa0IsZUFEQSxFQUVQbEIsTUFBTSxDQUFDbUIsZUFGQSxFQUdQbkIsTUFBTSxDQUFDbUQsaUJBSEEsQ0FISDtBQVFOakQsZUFBTyxFQUFFLENBQUMsTUFBRCxFQUFTLFlBQVQsRUFBdUIsZUFBdkI7QUFSSCxPQUFELENBREU7QUFBQSxLQUFYO0FBV0Q7QUFoQlksQ0FBZjtBQW1CQUgsT0FBTyxDQUFDcUQsUUFBUixHQUFtQjtBQUNqQjVDLFVBQVEsRUFBRSxFQURPO0FBRWpCTyxRQUFNLEVBQUUsZ0JBQUFmLE1BQU0sRUFBSTtBQUNoQkssZ0JBQVksQ0FBQyxVQUFELEVBQWFMLE1BQWIsQ0FBWjtBQUVBLFdBQU8sVUFBQTlTLElBQUk7QUFBQSxhQUNUdU4sT0FBTyxDQUFDO0FBQ05sRSxpQkFBUyxFQUFFeUssNkNBQU0sQ0FBQ25OLFVBQVAsQ0FBa0J1UCxRQUR2QjtBQUVObkQsY0FBTSxFQUFFLENBQUMvUyxJQUFJLENBQUNyQixJQUFOLEVBQVlxQixJQUFJLENBQUNwQixHQUFqQixFQUFzQm9CLElBQUksQ0FBQ25CLE1BQTNCLENBRkY7QUFHTmdMLGVBQU8sRUFBRSxFQUhIO0FBSU5tSixlQUFPLEVBQUUsQ0FBQyxRQUFEO0FBSkgsT0FBRCxDQURFO0FBQUEsS0FBWDtBQU9EO0FBWmdCLENBQW5CO0FBZUFILE9BQU8sQ0FBQ3NELElBQVIsR0FBZTtBQUNiN0MsVUFBUSxFQUFFLENBQUMsaUJBQUQsQ0FERztBQUViTyxRQUFNLEVBQUUsZ0JBQUFmLE1BQU0sRUFBSTtBQUNoQkssZ0JBQVksQ0FBQyxNQUFELEVBQVNMLE1BQVQsQ0FBWjtBQUVBLFdBQU8sVUFBQTlTLElBQUk7QUFBQSxhQUNUdU4sT0FBTyxDQUFDO0FBQ05sRSxpQkFBUyxFQUFFeUssNkNBQU0sQ0FBQ25OLFVBQVAsQ0FBa0J3UCxJQUR2QjtBQUVOcEQsY0FBTSxFQUFFLENBQUMvUyxJQUFJLENBQUNyQixJQUFOLEVBQVlxQixJQUFJLENBQUNwQixHQUFqQixDQUZGO0FBR05pTCxlQUFPLEVBQUUsQ0FBQ2lKLE1BQU0sQ0FBQ3FCLGVBQVIsQ0FISDtBQUlObkIsZUFBTyxFQUFFLENBQUMsUUFBRDtBQUpILE9BQUQsQ0FERTtBQUFBLEtBQVg7QUFPRDtBQVpZLENBQWY7QUFlQUgsT0FBTyxDQUFDdUQsUUFBUixHQUFtQjtBQUNqQjlDLFVBQVEsRUFBRSxFQURPO0FBRWpCTyxRQUFNLEVBQUUsZ0JBQUFmLE1BQU0sRUFBSTtBQUNoQkssZ0JBQVksQ0FBQyxVQUFELEVBQWFMLE1BQWIsQ0FBWjtBQUVBLFdBQU8sVUFBQTlTLElBQUk7QUFBQSxhQUNUdU4sT0FBTyxDQUFDO0FBQ05sRSxpQkFBUyxFQUFFeUssNkNBQU0sQ0FBQ25OLFVBQVAsQ0FBa0J5UCxRQUR2QjtBQUVOckQsY0FBTSxFQUFFLENBQUMvUyxJQUFJLENBQUNyQixJQUFOLEVBQVlxQixJQUFJLENBQUNwQixHQUFqQixDQUZGO0FBR05pTCxlQUFPLEVBQUUsRUFISDtBQUlObUosZUFBTyxFQUFFLENBQUMsUUFBRDtBQUpILE9BQUQsQ0FERTtBQUFBLEtBQVg7QUFPRDtBQVpnQixDQUFuQjtBQWVBSCxPQUFPLENBQUN3RCxHQUFSLEdBQWM7QUFDWi9DLFVBQVEsRUFBRSxDQUFDLGlCQUFELENBREU7QUFFWk8sUUFBTSxFQUFFLGdCQUFBZixNQUFNLEVBQUk7QUFDaEJLLGdCQUFZLENBQUMsS0FBRCxFQUFRTCxNQUFSLENBQVo7QUFFQSxXQUFPLFVBQUE5UyxJQUFJO0FBQUEsYUFDVHVOLE9BQU8sQ0FBQztBQUNObEUsaUJBQVMsRUFBRXlLLDZDQUFNLENBQUNuTixVQUFQLENBQWtCMFAsR0FEdkI7QUFFTnRELGNBQU0sRUFBRSxDQUFDL1MsSUFBSSxDQUFDckIsSUFBTixFQUFZcUIsSUFBSSxDQUFDcEIsR0FBakIsRUFBc0JvQixJQUFJLENBQUN0QixLQUEzQixFQUFrQ3NCLElBQUksQ0FBQ25CLE1BQXZDLENBRkY7QUFHTmdMLGVBQU8sRUFBRSxDQUFDaUosTUFBTSxDQUFDcUIsZUFBUixDQUhIO0FBSU5uQixlQUFPLEVBQUUsQ0FBQyxRQUFEO0FBSkgsT0FBRCxDQURFO0FBQUEsS0FBWDtBQU9EO0FBWlcsQ0FBZDtBQWVBSCxPQUFPLENBQUN5RCxHQUFSLEdBQWM7QUFDWmhELFVBQVEsRUFBRSxDQUFDLGlCQUFELENBREU7QUFFWk8sUUFBTSxFQUFFLGdCQUFBZixNQUFNLEVBQUk7QUFDaEJLLGdCQUFZLENBQUMsS0FBRCxFQUFRTCxNQUFSLENBQVo7QUFFQSxXQUFPLFVBQUE5UyxJQUFJO0FBQUEsYUFDVHVOLE9BQU8sQ0FBQztBQUNObEUsaUJBQVMsRUFBRXlLLDZDQUFNLENBQUNuTixVQUFQLENBQWtCMlAsR0FEdkI7QUFFTnZELGNBQU0sRUFBRSxDQUFDL1MsSUFBSSxDQUFDdEIsS0FBTixDQUZGO0FBR05tTCxlQUFPLEVBQUUsQ0FBQ2lKLE1BQU0sQ0FBQ3FCLGVBQVIsQ0FISDtBQUlObkIsZUFBTyxFQUFFLENBQUMsU0FBRCxFQUFZLFNBQVo7QUFKSCxPQUFELENBREU7QUFBQSxLQUFYO0FBT0Q7QUFaVyxDQUFkO0FBZUFILE9BQU8sQ0FBQzBELElBQVIsR0FBZTtBQUNiakQsVUFBUSxFQUFFLENBQUMsaUJBQUQsQ0FERztBQUViTyxRQUFNLEVBQUUsZ0JBQUFmLE1BQU0sRUFBSTtBQUNoQkssZ0JBQVksQ0FBQyxNQUFELEVBQVNMLE1BQVQsQ0FBWjtBQUVBLFdBQU8sVUFBQTlTLElBQUk7QUFBQSxhQUNUdU4sT0FBTyxDQUFDO0FBQ05sRSxpQkFBUyxFQUFFeUssNkNBQU0sQ0FBQ25OLFVBQVAsQ0FBa0I0UCxJQUR2QjtBQUVOeEQsY0FBTSxFQUFFLENBQUMvUyxJQUFJLENBQUNyQixJQUFOLEVBQVlxQixJQUFJLENBQUNwQixHQUFqQixFQUFzQm9CLElBQUksQ0FBQ3RCLEtBQTNCLENBRkY7QUFHTm1MLGVBQU8sRUFBRSxDQUFDaUosTUFBTSxDQUFDcUIsZUFBUixDQUhIO0FBSU5uQixlQUFPLEVBQUUsQ0FBQyxRQUFEO0FBSkgsT0FBRCxDQURFO0FBQUEsS0FBWDtBQU9EO0FBWlksQ0FBZjtBQWVBSCxPQUFPLENBQUMyRCxHQUFSLEdBQWM7QUFDWmxELFVBQVEsRUFBRSxFQURFO0FBRVpPLFFBQU0sRUFBRSxnQkFBQWYsTUFBTSxFQUFJO0FBQ2hCSyxnQkFBWSxDQUFDLEtBQUQsRUFBUUwsTUFBUixDQUFaO0FBRUEsV0FBTyxVQUFBOVMsSUFBSTtBQUFBLGFBQ1R1TixPQUFPLENBQUM7QUFDTmxFLGlCQUFTLEVBQUV5Syw2Q0FBTSxDQUFDbk4sVUFBUCxDQUFrQjZQLEdBRHZCO0FBRU56RCxjQUFNLEVBQUUsQ0FBQy9TLElBQUksQ0FBQ3RCLEtBQU4sRUFBYXNCLElBQUksQ0FBQ25CLE1BQWxCLENBRkY7QUFHTmdMLGVBQU8sRUFBRSxFQUhIO0FBSU5tSixlQUFPLEVBQUUsQ0FBQyxRQUFEO0FBSkgsT0FBRCxDQURFO0FBQUEsS0FBWDtBQU9EO0FBWlcsQ0FBZDtBQWVBSCxPQUFPLENBQUM0RCxHQUFSLEdBQWM7QUFDWm5ELFVBQVEsRUFBRSxFQURFO0FBRVpPLFFBQU0sRUFBRSxnQkFBQWYsTUFBTSxFQUFJO0FBQ2hCSyxnQkFBWSxDQUFDLEtBQUQsRUFBUUwsTUFBUixDQUFaO0FBRUEsV0FBTyxVQUFBOVMsSUFBSTtBQUFBLGFBQ1R1TixPQUFPLENBQUM7QUFDTmxFLGlCQUFTLEVBQUV5Syw2Q0FBTSxDQUFDbk4sVUFBUCxDQUFrQjhQLEdBRHZCO0FBRU4xRCxjQUFNLEVBQUUsQ0FBQy9TLElBQUksQ0FBQ3RCLEtBQU4sRUFBYXNCLElBQUksQ0FBQ25CLE1BQWxCLENBRkY7QUFHTmdMLGVBQU8sRUFBRSxFQUhIO0FBSU5tSixlQUFPLEVBQUUsQ0FBQyxRQUFEO0FBSkgsT0FBRCxDQURFO0FBQUEsS0FBWDtBQU9EO0FBWlcsQ0FBZDtBQWVBSCxPQUFPLENBQUM2RCxHQUFSLEdBQWM7QUFDWnBELFVBQVEsRUFBRSxDQUFDLGlCQUFELEVBQW9CLGlCQUFwQixDQURFO0FBRVpPLFFBQU0sRUFBRSxnQkFBQWYsTUFBTSxFQUFJO0FBQ2hCSyxnQkFBWSxDQUFDLEtBQUQsRUFBUUwsTUFBUixDQUFaO0FBRUEsV0FBTyxVQUFBOVMsSUFBSTtBQUFBLGFBQ1R1TixPQUFPLENBQUM7QUFDTmxFLGlCQUFTLEVBQUV5Syw2Q0FBTSxDQUFDbk4sVUFBUCxDQUFrQitQLEdBRHZCO0FBRU4zRCxjQUFNLEVBQUUsQ0FBQy9TLElBQUksQ0FBQ3RCLEtBQU4sQ0FGRjtBQUdObUwsZUFBTyxFQUFFLENBQUNpSixNQUFNLENBQUNrQixlQUFSLEVBQXlCbEIsTUFBTSxDQUFDbUIsZUFBaEMsQ0FISDtBQUlOakIsZUFBTyxFQUFFLENBQUMsUUFBRDtBQUpILE9BQUQsQ0FERTtBQUFBLEtBQVg7QUFPRDtBQVpXLENBQWQ7QUFlQUgsT0FBTyxDQUFDOEQsSUFBUixHQUFlO0FBQ2JyRCxVQUFRLEVBQUUsQ0FBQyxtQkFBRCxFQUFzQixjQUF0QixDQURHO0FBRWJPLFFBQU0sRUFBRSxnQkFBQWYsTUFBTSxFQUFJO0FBQ2hCSyxnQkFBWSxDQUFDLE1BQUQsRUFBU0wsTUFBVCxDQUFaO0FBRUEsV0FBTyxVQUFBOVMsSUFBSTtBQUFBLGFBQ1R1TixPQUFPLENBQUM7QUFDTmxFLGlCQUFTLEVBQUV5Syw2Q0FBTSxDQUFDbk4sVUFBUCxDQUFrQmdRLElBRHZCO0FBRU41RCxjQUFNLEVBQUUsQ0FBQy9TLElBQUksQ0FBQ3JCLElBQU4sRUFBWXFCLElBQUksQ0FBQ3BCLEdBQWpCLENBRkY7QUFHTmlMLGVBQU8sRUFBRSxDQUFDaUosTUFBTSxDQUFDOEQsaUJBQVIsRUFBMkI5RCxNQUFNLENBQUMrRCxZQUFsQyxDQUhIO0FBSU43RCxlQUFPLEVBQUUsQ0FBQyxRQUFEO0FBSkgsT0FBRCxDQURFO0FBQUEsS0FBWDtBQU9EO0FBWlksQ0FBZjtBQWVBSCxPQUFPLENBQUNpRSxHQUFSLEdBQWM7QUFDWnhELFVBQVEsRUFBRSxFQURFO0FBRVpPLFFBQU0sRUFBRSxnQkFBQWYsTUFBTSxFQUFJO0FBQ2hCSyxnQkFBWSxDQUFDLEtBQUQsRUFBUUwsTUFBUixDQUFaO0FBRUEsV0FBTyxVQUFBOVMsSUFBSTtBQUFBLGFBQ1R1TixPQUFPLENBQUM7QUFDTmxFLGlCQUFTLEVBQUV5Syw2Q0FBTSxDQUFDbk4sVUFBUCxDQUFrQm1RLEdBRHZCO0FBRU4vRCxjQUFNLEVBQUUsQ0FBQy9TLElBQUksQ0FBQ3RCLEtBQU4sRUFBYXNCLElBQUksQ0FBQ25CLE1BQWxCLENBRkY7QUFHTmdMLGVBQU8sRUFBRSxFQUhIO0FBSU5tSixlQUFPLEVBQUUsQ0FBQyxRQUFEO0FBSkgsT0FBRCxDQURFO0FBQUEsS0FBWDtBQU9EO0FBWlcsQ0FBZDtBQWVBSCxPQUFPLENBQUNrRSxNQUFSLEdBQWlCO0FBQ2Z6RCxVQUFRLEVBQUUsQ0FBQyxpQkFBRCxDQURLO0FBRWZPLFFBQU0sRUFBRSxnQkFBQWYsTUFBTSxFQUFJO0FBQ2hCSyxnQkFBWSxDQUFDLFFBQUQsRUFBV0wsTUFBWCxDQUFaO0FBRUEsV0FBTyxVQUFBOVMsSUFBSTtBQUFBLGFBQ1R1TixPQUFPLENBQUM7QUFDTmxFLGlCQUFTLEVBQUV5Syw2Q0FBTSxDQUFDbk4sVUFBUCxDQUFrQm9RLE1BRHZCO0FBRU5oRSxjQUFNLEVBQUUsQ0FBQy9TLElBQUksQ0FBQ3ZCLElBQU4sRUFBWXVCLElBQUksQ0FBQ3RCLEtBQWpCLENBRkY7QUFHTm1MLGVBQU8sRUFBRSxDQUFDaUosTUFBTSxDQUFDcUIsZUFBUixDQUhIO0FBSU5uQixlQUFPLEVBQUUsQ0FBQyxRQUFEO0FBSkgsT0FBRCxDQURFO0FBQUEsS0FBWDtBQU9EO0FBWmMsQ0FBakI7QUFlQUgsT0FBTyxDQUFDbUUsR0FBUixHQUFjO0FBQ1oxRCxVQUFRLEVBQUUsQ0FBQyxpQkFBRCxDQURFO0FBRVpPLFFBQU0sRUFBRSxnQkFBQWYsTUFBTSxFQUFJO0FBQ2hCSyxnQkFBWSxDQUFDLEtBQUQsRUFBUUwsTUFBUixDQUFaO0FBRUEsV0FBTyxVQUFBOVMsSUFBSTtBQUFBLGFBQ1R1TixPQUFPLENBQUM7QUFDTmxFLGlCQUFTLEVBQUV5Syw2Q0FBTSxDQUFDbk4sVUFBUCxDQUFrQnFRLEdBRHZCO0FBRU5qRSxjQUFNLEVBQUUsQ0FBQy9TLElBQUksQ0FBQ3RCLEtBQU4sQ0FGRjtBQUdObUwsZUFBTyxFQUFFLENBQUNpSixNQUFNLENBQUNxQixlQUFSLENBSEg7QUFJTm5CLGVBQU8sRUFBRSxDQUFDLFFBQUQ7QUFKSCxPQUFELENBREU7QUFBQSxLQUFYO0FBT0Q7QUFaVyxDQUFkO0FBZUFILE9BQU8sQ0FBQ29FLElBQVIsR0FBZTtBQUNiM0QsVUFBUSxFQUFFLENBQUMsaUJBQUQsQ0FERztBQUViTyxRQUFNLEVBQUUsZ0JBQUFmLE1BQU0sRUFBSTtBQUNoQkssZ0JBQVksQ0FBQyxNQUFELEVBQVNMLE1BQVQsQ0FBWjtBQUVBLFdBQU8sVUFBQTlTLElBQUk7QUFBQSxhQUNUdU4sT0FBTyxDQUFDO0FBQ05sRSxpQkFBUyxFQUFFeUssNkNBQU0sQ0FBQ25OLFVBQVAsQ0FBa0JzUSxJQUR2QjtBQUVObEUsY0FBTSxFQUFFLENBQUMvUyxJQUFJLENBQUN0QixLQUFOLENBRkY7QUFHTm1MLGVBQU8sRUFBRSxDQUFDaUosTUFBTSxDQUFDcUIsZUFBUixDQUhIO0FBSU5uQixlQUFPLEVBQUUsQ0FBQyxRQUFEO0FBSkgsT0FBRCxDQURFO0FBQUEsS0FBWDtBQU9EO0FBWlksQ0FBZjtBQWVBSCxPQUFPLENBQUNxRSxHQUFSLEdBQWM7QUFDWjVELFVBQVEsRUFBRSxDQUFDLGlCQUFELENBREU7QUFFWk8sUUFBTSxFQUFFLGdCQUFBZixNQUFNLEVBQUk7QUFDaEJLLGdCQUFZLENBQUMsS0FBRCxFQUFRTCxNQUFSLENBQVo7QUFFQSxXQUFPLFVBQUE5UyxJQUFJO0FBQUEsYUFDVHVOLE9BQU8sQ0FBQztBQUNObEUsaUJBQVMsRUFBRXlLLDZDQUFNLENBQUNuTixVQUFQLENBQWtCdVEsR0FEdkI7QUFFTm5FLGNBQU0sRUFBRSxDQUFDL1MsSUFBSSxDQUFDdEIsS0FBTixDQUZGO0FBR05tTCxlQUFPLEVBQUUsQ0FBQ2lKLE1BQU0sQ0FBQ3FCLGVBQVIsQ0FISDtBQUlObkIsZUFBTyxFQUFFLENBQUMsUUFBRDtBQUpILE9BQUQsQ0FERTtBQUFBLEtBQVg7QUFPRDtBQVpXLENBQWQ7QUFlQUgsT0FBTyxDQUFDc0UsR0FBUixHQUFjO0FBQ1o3RCxVQUFRLEVBQUUsQ0FBQyxpQkFBRCxDQURFO0FBRVpPLFFBQU0sRUFBRSxnQkFBQWYsTUFBTSxFQUFJO0FBQ2hCSyxnQkFBWSxDQUFDLEtBQUQsRUFBUUwsTUFBUixDQUFaO0FBRUEsV0FBTyxVQUFBOVMsSUFBSTtBQUFBLGFBQ1R1TixPQUFPLENBQUM7QUFDTmxFLGlCQUFTLEVBQUV5Syw2Q0FBTSxDQUFDbk4sVUFBUCxDQUFrQndRLEdBRHZCO0FBRU5wRSxjQUFNLEVBQUUsQ0FBQy9TLElBQUksQ0FBQ3RCLEtBQU4sQ0FGRjtBQUdObUwsZUFBTyxFQUFFLENBQUNpSixNQUFNLENBQUNxQixlQUFSLENBSEg7QUFJTm5CLGVBQU8sRUFBRSxDQUFDLFFBQUQ7QUFKSCxPQUFELENBREU7QUFBQSxLQUFYO0FBT0Q7QUFaVyxDQUFkO0FBZUFILE9BQU8sQ0FBQ3VFLE1BQVIsR0FBaUI7QUFDZjlELFVBQVEsRUFBRSxDQUFDLGlCQUFELENBREs7QUFFZk8sUUFBTSxFQUFFLGdCQUFBZixNQUFNLEVBQUk7QUFDaEJLLGdCQUFZLENBQUMsUUFBRCxFQUFXTCxNQUFYLENBQVo7QUFFQSxXQUFPLFVBQUE5UyxJQUFJO0FBQUEsYUFDVHVOLE9BQU8sQ0FBQztBQUNObEUsaUJBQVMsRUFBRXlLLDZDQUFNLENBQUNuTixVQUFQLENBQWtCeVEsTUFEdkI7QUFFTnJFLGNBQU0sRUFBRSxDQUFDL1MsSUFBSSxDQUFDdEIsS0FBTixDQUZGO0FBR05tTCxlQUFPLEVBQUUsQ0FBQ2lKLE1BQU0sQ0FBQ3FCLGVBQVIsQ0FISDtBQUlObkIsZUFBTyxFQUFFLENBQUMsUUFBRDtBQUpILE9BQUQsQ0FERTtBQUFBLEtBQVg7QUFPRDtBQVpjLENBQWpCO0FBZUFILE9BQU8sQ0FBQ3dFLEtBQVIsR0FBZ0I7QUFDZC9ELFVBQVEsRUFBRSxDQUFDLGtCQUFELEVBQXFCLGtCQUFyQixFQUF5QyxrQkFBekMsQ0FESTtBQUVkTyxRQUFNLEVBQUUsZ0JBQUFmLE1BQU0sRUFBSTtBQUNoQkssZ0JBQVksQ0FBQyxPQUFELEVBQVVMLE1BQVYsQ0FBWjtBQUVBLFdBQU8sVUFBQTlTLElBQUk7QUFBQSxhQUNUdU4sT0FBTyxDQUFDO0FBQ05sRSxpQkFBUyxFQUFFeUssNkNBQU0sQ0FBQ25OLFVBQVAsQ0FBa0IwUSxLQUR2QjtBQUVOdEUsY0FBTSxFQUFFLENBQUMvUyxJQUFJLENBQUNyQixJQUFOLEVBQVlxQixJQUFJLENBQUNwQixHQUFqQixFQUFzQm9CLElBQUksQ0FBQ3RCLEtBQTNCLENBRkY7QUFHTm1MLGVBQU8sRUFBRSxDQUNQaUosTUFBTSxDQUFDd0UsZ0JBREEsRUFFUHhFLE1BQU0sQ0FBQ3lFLGdCQUZBLEVBR1B6RSxNQUFNLENBQUMwRSxnQkFIQSxDQUhIO0FBUU54RSxlQUFPLEVBQUUsQ0FBQyxRQUFELEVBQVcsUUFBWDtBQVJILE9BQUQsQ0FERTtBQUFBLEtBQVg7QUFXRDtBQWhCYSxDQUFoQjtBQW1CQUgsT0FBTyxDQUFDNEUsR0FBUixHQUFjO0FBQ1puRSxVQUFRLEVBQUUsQ0FBQyxpQkFBRCxDQURFO0FBRVpPLFFBQU0sRUFBRSxnQkFBQWYsTUFBTSxFQUFJO0FBQ2hCSyxnQkFBWSxDQUFDLEtBQUQsRUFBUUwsTUFBUixDQUFaO0FBRUEsV0FBTyxVQUFBOVMsSUFBSTtBQUFBLGFBQ1R1TixPQUFPLENBQUM7QUFDTmxFLGlCQUFTLEVBQUV5Syw2Q0FBTSxDQUFDbk4sVUFBUCxDQUFrQjhRLEdBRHZCO0FBRU4xRSxjQUFNLEVBQUUsQ0FBQy9TLElBQUksQ0FBQ3RCLEtBQU4sQ0FGRjtBQUdObUwsZUFBTyxFQUFFLENBQUNpSixNQUFNLENBQUNxQixlQUFSLENBSEg7QUFJTm5CLGVBQU8sRUFBRSxDQUFDLFFBQUQ7QUFKSCxPQUFELENBREU7QUFBQSxLQUFYO0FBT0Q7QUFaVyxDQUFkO0FBZUFILE9BQU8sQ0FBQzZFLElBQVIsR0FBZTtBQUNicEUsVUFBUSxFQUFFLENBQUMsaUJBQUQsQ0FERztBQUViTyxRQUFNLEVBQUUsZ0JBQUFmLE1BQU0sRUFBSTtBQUNoQkssZ0JBQVksQ0FBQyxNQUFELEVBQVNMLE1BQVQsQ0FBWjtBQUVBLFdBQU8sVUFBQTlTLElBQUk7QUFBQSxhQUNUdU4sT0FBTyxDQUFDO0FBQ05sRSxpQkFBUyxFQUFFeUssNkNBQU0sQ0FBQ25OLFVBQVAsQ0FBa0IrUSxJQUR2QjtBQUVOM0UsY0FBTSxFQUFFLENBQUMvUyxJQUFJLENBQUN0QixLQUFOLENBRkY7QUFHTm1MLGVBQU8sRUFBRSxDQUFDaUosTUFBTSxDQUFDcUIsZUFBUixDQUhIO0FBSU5uQixlQUFPLEVBQUUsQ0FBQyxRQUFEO0FBSkgsT0FBRCxDQURFO0FBQUEsS0FBWDtBQU9EO0FBWlksQ0FBZjtBQWVBSCxPQUFPLENBQUM4RSxFQUFSLEdBQWE7QUFDWHJFLFVBQVEsRUFBRSxFQURDO0FBRVhPLFFBQU0sRUFBRSxnQkFBQWYsTUFBTSxFQUFJO0FBQ2hCSyxnQkFBWSxDQUFDLElBQUQsRUFBT0wsTUFBUCxDQUFaO0FBRUEsV0FBTyxVQUFBOVMsSUFBSTtBQUFBLGFBQ1R1TixPQUFPLENBQUM7QUFDTmxFLGlCQUFTLEVBQUV5Syw2Q0FBTSxDQUFDbk4sVUFBUCxDQUFrQmdSLEVBRHZCO0FBRU41RSxjQUFNLEVBQUUsQ0FBQy9TLElBQUksQ0FBQ3JCLElBQU4sRUFBWXFCLElBQUksQ0FBQ3BCLEdBQWpCLEVBQXNCb0IsSUFBSSxDQUFDdEIsS0FBM0IsQ0FGRjtBQUdObUwsZUFBTyxFQUFFLEVBSEg7QUFJTm1KLGVBQU8sRUFBRSxDQUFDLFFBQUQ7QUFKSCxPQUFELENBREU7QUFBQSxLQUFYO0FBT0Q7QUFaVSxDQUFiO0FBZUFILE9BQU8sQ0FBQytFLEtBQVIsR0FBZ0I7QUFDZHRFLFVBQVEsRUFBRSxDQUFDLGlCQUFELENBREk7QUFFZE8sUUFBTSxFQUFFLGdCQUFBZixNQUFNLEVBQUk7QUFDaEJLLGdCQUFZLENBQUMsT0FBRCxFQUFVTCxNQUFWLENBQVo7QUFFQSxXQUFPLFVBQUE5UyxJQUFJO0FBQUEsYUFDVHVOLE9BQU8sQ0FBQztBQUNObEUsaUJBQVMsRUFBRXlLLDZDQUFNLENBQUNuTixVQUFQLENBQWtCaVIsS0FEdkI7QUFFTjdFLGNBQU0sRUFBRSxDQUFDL1MsSUFBSSxDQUFDdEIsS0FBTixDQUZGO0FBR05tTCxlQUFPLEVBQUUsQ0FBQ2lKLE1BQU0sQ0FBQ3FCLGVBQVIsQ0FISDtBQUlObkIsZUFBTyxFQUFFLENBQUMsUUFBRDtBQUpILE9BQUQsQ0FERTtBQUFBLEtBQVg7QUFPRDtBQVphLENBQWhCO0FBZUFILE9BQU8sQ0FBQ2dGLElBQVIsR0FBZTtBQUNidkUsVUFBUSxFQUFFLENBQUMsaUJBQUQsQ0FERztBQUViTyxRQUFNLEVBQUUsZ0JBQUFmLE1BQU0sRUFBSTtBQUNoQkssZ0JBQVksQ0FBQyxNQUFELEVBQVNMLE1BQVQsQ0FBWjtBQUVBLFdBQU8sVUFBQTlTLElBQUk7QUFBQSxhQUNUdU4sT0FBTyxDQUFDO0FBQ05sRSxpQkFBUyxFQUFFeUssNkNBQU0sQ0FBQ25OLFVBQVAsQ0FBa0JrUixJQUR2QjtBQUVOOUUsY0FBTSxFQUFFLENBQUMvUyxJQUFJLENBQUN0QixLQUFOLENBRkY7QUFHTm1MLGVBQU8sRUFBRSxDQUFDaUosTUFBTSxDQUFDcUIsZUFBUixDQUhIO0FBSU5uQixlQUFPLEVBQUUsQ0FBQyxRQUFEO0FBSkgsT0FBRCxDQURFO0FBQUEsS0FBWDtBQU9EO0FBWlksQ0FBZjtBQWVBSCxPQUFPLENBQUNpRixHQUFSLEdBQWM7QUFDWnhFLFVBQVEsRUFBRSxDQUFDLGlCQUFELENBREU7QUFFWk8sUUFBTSxFQUFFLGdCQUFBZixNQUFNLEVBQUk7QUFDaEJLLGdCQUFZLENBQUMsS0FBRCxFQUFRTCxNQUFSLENBQVo7QUFFQSxXQUFPLFVBQUE5UyxJQUFJO0FBQUEsYUFDVHVOLE9BQU8sQ0FBQztBQUNObEUsaUJBQVMsRUFBRXlLLDZDQUFNLENBQUNuTixVQUFQLENBQWtCbVIsR0FEdkI7QUFFTi9FLGNBQU0sRUFBRSxDQUFDL1MsSUFBSSxDQUFDdEIsS0FBTixDQUZGO0FBR05tTCxlQUFPLEVBQUUsQ0FBQ2lKLE1BQU0sQ0FBQ3FCLGVBQVIsQ0FISDtBQUlObkIsZUFBTyxFQUFFLENBQUMsUUFBRDtBQUpILE9BQUQsQ0FERTtBQUFBLEtBQVg7QUFPRDtBQVpXLENBQWQ7QUFlQUgsT0FBTyxDQUFDa0YsUUFBUixHQUFtQjtBQUNqQnpFLFVBQVEsRUFBRSxFQURPO0FBRWpCTyxRQUFNLEVBQUUsZ0JBQUFmLE1BQU0sRUFBSTtBQUNoQkssZ0JBQVksQ0FBQyxVQUFELEVBQWFMLE1BQWIsQ0FBWjtBQUVBLFdBQU8sVUFBQTlTLElBQUk7QUFBQSxhQUNUdU4sT0FBTyxDQUFDO0FBQ05sRSxpQkFBUyxFQUFFeUssNkNBQU0sQ0FBQ25OLFVBQVAsQ0FBa0JvUixRQUR2QjtBQUVOaEYsY0FBTSxFQUFFLENBQUMvUyxJQUFJLENBQUNyQixJQUFOLEVBQVlxQixJQUFJLENBQUNwQixHQUFqQixFQUFzQm9CLElBQUksQ0FBQ3RCLEtBQTNCLENBRkY7QUFHTm1MLGVBQU8sRUFBRSxFQUhIO0FBSU5tSixlQUFPLEVBQUUsQ0FBQyxRQUFEO0FBSkgsT0FBRCxDQURFO0FBQUEsS0FBWDtBQU9EO0FBWmdCLENBQW5CO0FBZUFILE9BQU8sQ0FBQ21GLE1BQVIsR0FBaUI7QUFDZjFFLFVBQVEsRUFBRSxDQUFDLGtCQUFELEVBQXFCLGtCQUFyQixFQUF5QyxrQkFBekMsQ0FESztBQUVmTyxRQUFNLEVBQUUsZ0JBQUFmLE1BQU0sRUFBSTtBQUNoQkssZ0JBQVksQ0FBQyxRQUFELEVBQVdMLE1BQVgsQ0FBWjtBQUVBLFdBQU8sVUFBQTlTLElBQUk7QUFBQSxhQUNUdU4sT0FBTyxDQUFDO0FBQ05sRSxpQkFBUyxFQUFFeUssNkNBQU0sQ0FBQ25OLFVBQVAsQ0FBa0JxUixNQUR2QjtBQUVOakYsY0FBTSxFQUFFLENBQUMvUyxJQUFJLENBQUNyQixJQUFOLEVBQVlxQixJQUFJLENBQUNwQixHQUFqQixFQUFzQm9CLElBQUksQ0FBQ3RCLEtBQTNCLENBRkY7QUFHTm1MLGVBQU8sRUFBRSxDQUNQaUosTUFBTSxDQUFDbUYsZ0JBREEsRUFFUG5GLE1BQU0sQ0FBQ29GLGdCQUZBLEVBR1BwRixNQUFNLENBQUNxRixnQkFIQSxDQUhIO0FBUU5uRixlQUFPLEVBQUUsQ0FBQyxRQUFEO0FBUkgsT0FBRCxDQURFO0FBQUEsS0FBWDtBQVdEO0FBaEJjLENBQWpCO0FBbUJBSCxPQUFPLENBQUN1RixHQUFSLEdBQWM7QUFDWjlFLFVBQVEsRUFBRSxDQUFDLGlCQUFELENBREU7QUFFWk8sUUFBTSxFQUFFLGdCQUFBZixNQUFNLEVBQUk7QUFDaEJLLGdCQUFZLENBQUMsS0FBRCxFQUFRTCxNQUFSLENBQVo7QUFFQSxXQUFPLFVBQUE5UyxJQUFJO0FBQUEsYUFDVHVOLE9BQU8sQ0FBQztBQUNObEUsaUJBQVMsRUFBRXlLLDZDQUFNLENBQUNuTixVQUFQLENBQWtCeVIsR0FEdkI7QUFFTnJGLGNBQU0sRUFBRSxDQUFDL1MsSUFBSSxDQUFDdEIsS0FBTixDQUZGO0FBR05tTCxlQUFPLEVBQUUsQ0FBQ2lKLE1BQU0sQ0FBQ3FCLGVBQVIsQ0FISDtBQUlObkIsZUFBTyxFQUFFLENBQUMsUUFBRDtBQUpILE9BQUQsQ0FERTtBQUFBLEtBQVg7QUFPRDtBQVpXLENBQWQ7QUFlQUgsT0FBTyxDQUFDd0YsS0FBUixHQUFnQjtBQUNkL0UsVUFBUSxFQUFFLENBQUMsaUJBQUQsRUFBb0IsaUJBQXBCLEVBQXVDLFlBQXZDLENBREk7QUFFZE8sUUFBTSxFQUFFLGdCQUFBZixNQUFNLEVBQUk7QUFDaEJLLGdCQUFZLENBQUMsT0FBRCxFQUFVTCxNQUFWLENBQVo7QUFFQSxXQUFPLFVBQUE5UyxJQUFJO0FBQUEsYUFDVHVOLE9BQU8sQ0FBQztBQUNObEUsaUJBQVMsRUFBRXlLLDZDQUFNLENBQUNuTixVQUFQLENBQWtCMFIsS0FEdkI7QUFFTnRGLGNBQU0sRUFBRSxDQUFDL1MsSUFBSSxDQUFDdEIsS0FBTixDQUZGO0FBR05tTCxlQUFPLEVBQUUsQ0FDUGlKLE1BQU0sQ0FBQ2tCLGVBREEsRUFFUGxCLE1BQU0sQ0FBQ21CLGVBRkEsRUFHUG5CLE1BQU0sQ0FBQ3dGLFVBSEEsQ0FISDtBQVFOdEYsZUFBTyxFQUFFLENBQUMsUUFBRDtBQVJILE9BQUQsQ0FERTtBQUFBLEtBQVg7QUFXRDtBQWhCYSxDQUFoQjtBQW1CQUgsT0FBTyxDQUFDMEYsVUFBUixHQUFxQjtBQUNuQmpGLFVBQVEsRUFBRSxDQUFDLGlCQUFELENBRFM7QUFFbkJPLFFBQU0sRUFBRSxnQkFBQWYsTUFBTSxFQUFJO0FBQ2hCSyxnQkFBWSxDQUFDLFlBQUQsRUFBZUwsTUFBZixDQUFaO0FBRUEsV0FBTyxVQUFBOVMsSUFBSTtBQUFBLGFBQ1R1TixPQUFPLENBQUM7QUFDTmxFLGlCQUFTLEVBQUV5Syw2Q0FBTSxDQUFDbk4sVUFBUCxDQUFrQjRSLFVBRHZCO0FBRU54RixjQUFNLEVBQUUsQ0FBQy9TLElBQUksQ0FBQ3RCLEtBQU4sQ0FGRjtBQUdObUwsZUFBTyxFQUFFLENBQUNpSixNQUFNLENBQUNxQixlQUFSLENBSEg7QUFJTm5CLGVBQU8sRUFBRSxDQUFDLFFBQUQ7QUFKSCxPQUFELENBREU7QUFBQSxLQUFYO0FBT0Q7QUFaa0IsQ0FBckI7QUFlQUgsT0FBTyxDQUFDMkYsSUFBUixHQUFlO0FBQ2JsRixVQUFRLEVBQUUsQ0FBQyxpQkFBRCxFQUFvQixpQkFBcEIsQ0FERztBQUViTyxRQUFNLEVBQUUsZ0JBQUFmLE1BQU0sRUFBSTtBQUNoQkssZ0JBQVksQ0FBQyxNQUFELEVBQVNMLE1BQVQsQ0FBWjtBQUVBLFdBQU8sVUFBQTlTLElBQUk7QUFBQSxhQUNUdU4sT0FBTyxDQUFDO0FBQ05sRSxpQkFBUyxFQUFFeUssNkNBQU0sQ0FBQ25OLFVBQVAsQ0FBa0I2UixJQUR2QjtBQUVOekYsY0FBTSxFQUFFLENBQUMvUyxJQUFJLENBQUNuQixNQUFOLENBRkY7QUFHTmdMLGVBQU8sRUFBRSxDQUFDaUosTUFBTSxDQUFDa0IsZUFBUixFQUF5QmxCLE1BQU0sQ0FBQ21CLGVBQWhDLENBSEg7QUFJTmpCLGVBQU8sRUFBRSxDQUFDLFFBQUQ7QUFKSCxPQUFELENBREU7QUFBQSxLQUFYO0FBT0Q7QUFaWSxDQUFmO0FBZUFILE9BQU8sQ0FBQzRGLElBQVIsR0FBZTtBQUNibkYsVUFBUSxFQUFFLENBQUMsaUJBQUQsQ0FERztBQUViTyxRQUFNLEVBQUUsZ0JBQUFmLE1BQU0sRUFBSTtBQUNoQkssZ0JBQVksQ0FBQyxNQUFELEVBQVNMLE1BQVQsQ0FBWjtBQUVBLFdBQU8sVUFBQTlTLElBQUk7QUFBQSxhQUNUdU4sT0FBTyxDQUFDO0FBQ05sRSxpQkFBUyxFQUFFeUssNkNBQU0sQ0FBQ25OLFVBQVAsQ0FBa0I4UixJQUR2QjtBQUVOMUYsY0FBTSxFQUFFLENBQUMvUyxJQUFJLENBQUN0QixLQUFOLEVBQWFzQixJQUFJLENBQUNuQixNQUFsQixDQUZGO0FBR05nTCxlQUFPLEVBQUUsQ0FBQ2lKLE1BQU0sQ0FBQ3FCLGVBQVIsQ0FISDtBQUlObkIsZUFBTyxFQUFFLENBQUMsUUFBRDtBQUpILE9BQUQsQ0FERTtBQUFBLEtBQVg7QUFPRDtBQVpZLENBQWY7QUFlQUgsT0FBTyxDQUFDNkYsR0FBUixHQUFjO0FBQ1pwRixVQUFRLEVBQUUsRUFERTtBQUVaTyxRQUFNLEVBQUUsZ0JBQUFmLE1BQU0sRUFBSTtBQUNoQkssZ0JBQVksQ0FBQyxLQUFELEVBQVFMLE1BQVIsQ0FBWjtBQUVBLFdBQU8sVUFBQTlTLElBQUk7QUFBQSxhQUNUdU4sT0FBTyxDQUFDO0FBQ05sRSxpQkFBUyxFQUFFeUssNkNBQU0sQ0FBQ25OLFVBQVAsQ0FBa0IrUixHQUR2QjtBQUVOM0YsY0FBTSxFQUFFLENBQUMvUyxJQUFJLENBQUNyQixJQUFOLEVBQVlxQixJQUFJLENBQUNwQixHQUFqQixFQUFzQm9CLElBQUksQ0FBQ3RCLEtBQTNCLENBRkY7QUFHTm1MLGVBQU8sRUFBRSxFQUhIO0FBSU5tSixlQUFPLEVBQUUsQ0FBQyxRQUFEO0FBSkgsT0FBRCxDQURFO0FBQUEsS0FBWDtBQU9EO0FBWlcsQ0FBZDtBQWVBSCxPQUFPLENBQUM4RixPQUFSLEdBQWtCO0FBQ2hCckYsVUFBUSxFQUFFLEVBRE07QUFFaEJPLFFBQU0sRUFBRSxnQkFBQWYsTUFBTSxFQUFJO0FBQ2hCSyxnQkFBWSxDQUFDLFNBQUQsRUFBWUwsTUFBWixDQUFaO0FBRUEsV0FBTyxVQUFBOVMsSUFBSTtBQUFBLGFBQ1R1TixPQUFPLENBQUM7QUFDTmxFLGlCQUFTLEVBQUV5Syw2Q0FBTSxDQUFDbk4sVUFBUCxDQUFrQmdTLE9BRHZCO0FBRU41RixjQUFNLEVBQUUsQ0FBQy9TLElBQUksQ0FBQ3JCLElBQU4sRUFBWXFCLElBQUksQ0FBQ3BCLEdBQWpCLEVBQXNCb0IsSUFBSSxDQUFDdEIsS0FBM0IsQ0FGRjtBQUdObUwsZUFBTyxFQUFFLEVBSEg7QUFJTm1KLGVBQU8sRUFBRSxDQUFDLFFBQUQ7QUFKSCxPQUFELENBREU7QUFBQSxLQUFYO0FBT0Q7QUFaZSxDQUFsQjtBQWVBSCxPQUFPLENBQUMrRixPQUFSLEdBQWtCO0FBQ2hCdEYsVUFBUSxFQUFFLENBQUMsaUJBQUQsQ0FETTtBQUVoQk8sUUFBTSxFQUFFLGdCQUFBZixNQUFNLEVBQUk7QUFDaEJLLGdCQUFZLENBQUMsU0FBRCxFQUFZTCxNQUFaLENBQVo7QUFFQSxXQUFPLFVBQUE5UyxJQUFJO0FBQUEsYUFDVHVOLE9BQU8sQ0FBQztBQUNObEUsaUJBQVMsRUFBRXlLLDZDQUFNLENBQUNuTixVQUFQLENBQWtCaVMsT0FEdkI7QUFFTjdGLGNBQU0sRUFBRSxDQUFDL1MsSUFBSSxDQUFDdEIsS0FBTixDQUZGO0FBR05tTCxlQUFPLEVBQUUsQ0FBQ2lKLE1BQU0sQ0FBQ3FCLGVBQVIsQ0FISDtBQUlObkIsZUFBTyxFQUFFLENBQUMsUUFBRDtBQUpILE9BQUQsQ0FERTtBQUFBLEtBQVg7QUFPRDtBQVplLENBQWxCO0FBZUFILE9BQU8sQ0FBQ2dHLEtBQVIsR0FBZ0I7QUFDZHZGLFVBQVEsRUFBRSxDQUFDLGlCQUFELENBREk7QUFFZE8sUUFBTSxFQUFFLGdCQUFBZixNQUFNLEVBQUk7QUFDaEJLLGdCQUFZLENBQUMsT0FBRCxFQUFVTCxNQUFWLENBQVo7QUFFQSxXQUFPLFVBQUE5UyxJQUFJO0FBQUEsYUFDVHVOLE9BQU8sQ0FBQztBQUNObEUsaUJBQVMsRUFBRXlLLDZDQUFNLENBQUNuTixVQUFQLENBQWtCa1MsS0FEdkI7QUFFTjlGLGNBQU0sRUFBRSxDQUFDL1MsSUFBSSxDQUFDckIsSUFBTixFQUFZcUIsSUFBSSxDQUFDcEIsR0FBakIsRUFBc0JvQixJQUFJLENBQUN0QixLQUEzQixDQUZGO0FBR05tTCxlQUFPLEVBQUUsQ0FBQ2lKLE1BQU0sQ0FBQ3FCLGVBQVIsQ0FISDtBQUlObkIsZUFBTyxFQUFFLENBQUMsUUFBRDtBQUpILE9BQUQsQ0FERTtBQUFBLEtBQVg7QUFPRDtBQVphLENBQWhCO0FBZUFILE9BQU8sQ0FBQ2lHLEdBQVIsR0FBYztBQUNaeEYsVUFBUSxFQUFFLENBQUMsaUJBQUQsQ0FERTtBQUVaTyxRQUFNLEVBQUUsZ0JBQUFmLE1BQU0sRUFBSTtBQUNoQkssZ0JBQVksQ0FBQyxLQUFELEVBQVFMLE1BQVIsQ0FBWjtBQUVBLFdBQU8sVUFBQTlTLElBQUk7QUFBQSxhQUNUdU4sT0FBTyxDQUFDO0FBQ05sRSxpQkFBUyxFQUFFeUssNkNBQU0sQ0FBQ25OLFVBQVAsQ0FBa0JtUyxHQUR2QjtBQUVOL0YsY0FBTSxFQUFFLENBQUMvUyxJQUFJLENBQUN0QixLQUFOLENBRkY7QUFHTm1MLGVBQU8sRUFBRSxDQUFDaUosTUFBTSxDQUFDcUIsZUFBUixDQUhIO0FBSU5uQixlQUFPLEVBQUUsQ0FBQyxRQUFEO0FBSkgsT0FBRCxDQURFO0FBQUEsS0FBWDtBQU9EO0FBWlcsQ0FBZDtBQWVBSCxPQUFPLENBQUNrRyxLQUFSLEdBQWdCO0FBQ2R6RixVQUFRLEVBQUUsQ0FBQyxpQkFBRCxDQURJO0FBRWRPLFFBQU0sRUFBRSxnQkFBQWYsTUFBTSxFQUFJO0FBQ2hCSyxnQkFBWSxDQUFDLE9BQUQsRUFBVUwsTUFBVixDQUFaO0FBRUEsV0FBTyxVQUFBOVMsSUFBSTtBQUFBLGFBQ1R1TixPQUFPLENBQUM7QUFDTmxFLGlCQUFTLEVBQUV5Syw2Q0FBTSxDQUFDbk4sVUFBUCxDQUFrQm9TLEtBRHZCO0FBRU5oRyxjQUFNLEVBQUUsQ0FBQy9TLElBQUksQ0FBQ3RCLEtBQU4sQ0FGRjtBQUdObUwsZUFBTyxFQUFFLENBQUNpSixNQUFNLENBQUNxQixlQUFSLENBSEg7QUFJTm5CLGVBQU8sRUFBRSxDQUFDLFFBQUQ7QUFKSCxPQUFELENBREU7QUFBQSxLQUFYO0FBT0Q7QUFaYSxDQUFoQjtBQWVlSCxzRUFBZixFOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUMvakNBO0FBQ0E7O0lBRU1tRyxLOzs7OztBQUNKLGlCQUFZM1QsS0FBWixFQUFtQjtBQUFBOztBQUFBOztBQUNqQix5TUFBTUEsS0FBTjtBQUVBLFVBQUs0VCxTQUFMLEdBQWlCQywrQ0FBSyxDQUFDN1QsS0FBSyxDQUFDa0gsYUFBUCxDQUFMLENBQTJCc0gsTUFBM0IsQ0FBa0N4TyxLQUFLLENBQUN3RSxPQUF4QyxDQUFqQjtBQUhpQjtBQUlsQjs7Ozs7Ozs7Ozs7Ozs7OztBQUlHLHFCQUFLeEIsR0FBTCxDQUFTLE1BQVQ7O3VCQUNxQixLQUFLNFEsU0FBTCxDQUFlLEtBQUtsTSxZQUFwQixDOzs7QUFBZmxDLHNCO0FBQ04scUJBQUt4QyxHQUFMLENBQVMsUUFBVCxFQUFtQndDLE1BQW5CO0FBQ01zTywwQixHQUFhMVEsTUFBTSxDQUFDVyxJQUFQLENBQVl5QixNQUFaLEM7O0FBQ25CLG9CQUFJc08sVUFBVSxDQUFDdkwsTUFBWCxHQUFvQixDQUF4QixFQUEyQjtBQUN6QnVMLDRCQUFVLENBQUN0USxPQUFYLENBQW1CLFVBQUFELEdBQUcsRUFBSTtBQUN4QiwwQkFBSSxDQUFDQSxHQUFELENBQUosR0FBWWlDLE1BQU0sQ0FBQ2pDLEdBQUQsQ0FBbEI7QUFDRCxtQkFGRDtBQUdELGlCQUpELE1BSU87QUFDTCx1QkFBS2lDLE1BQUwsR0FBY0EsTUFBZDtBQUNEOztBQUNELHFCQUFLeEMsR0FBTCxDQUFTLGFBQVQsRUFBd0IsS0FBS3dDLE1BQTdCOzs7Ozs7OztBQUVBLHFCQUFLdkYsUUFBTCxDQUFjK0MsR0FBZCxDQUFrQmxKLEtBQWxCOzs7Ozs7Ozs7Ozs7Ozs7Ozs7O0VBdEJjdUssOEQ7O0FBNEJMc1Asb0VBQWYsRTs7Ozs7Ozs7Ozs7QUMvQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUFHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxnQkFBZ0I7QUFDaEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlFOzs7Ozs7Ozs7OztBQzFCQSxJQUFNSSxTQUFTLEdBQUc7QUFDaEJDLGlCQURnQiw2QkFDRTtBQUNoQixTQUFLaFIsR0FBTCxDQUFTLEtBQUtpUixjQUFkO0FBQ0QsR0FIZTtBQUloQnhQLE1BSmdCLGtCQUlUO0FBQ0wsU0FBS3pCLEdBQUwsQ0FBUyxNQUFUO0FBQ0EsU0FBS2lSLGNBQUwsR0FBc0IsTUFBdEI7QUFDQSxTQUFLQyxZQUFMLEdBQW9CO0FBQ2xCQyxVQUFJLEVBQUU7QUFEWSxLQUFwQjtBQUdBLFNBQUtDLFlBQUwsQ0FBa0IsT0FBbEIsRUFBMkIsS0FBM0IsRUFBa0M7QUFBRXZILFlBQU0sRUFBRTtBQUFWLEtBQWxDO0FBQ0QsR0FYZTtBQVloQjdHLE9BWmdCLG1CQVlSO0FBQ04sU0FBS2hELEdBQUwsQ0FBUyxPQUFUO0FBQ0EsU0FBS0EsR0FBTCxDQUFTLEtBQUszRyxNQUFkO0FBQ0EsU0FBSzJHLEdBQUwsQ0FBUyxLQUFLaVIsY0FBZDtBQUNBLFNBQUtqUixHQUFMLENBQVMsS0FBSzFCLFVBQUwsQ0FBZ0IrUyxLQUFoQixDQUFzQjdPLE1BQS9CO0FBQ0EsU0FBS3dPLGVBQUw7QUFDQSxRQUFNN04sU0FBUyxHQUFHO0FBQ2hCckssZUFBUyxFQUFFLElBQUl1SyxJQUFKLEdBQVdpTyxXQUROO0FBRWhCdlksWUFBTSxFQUFFLE1BRlE7QUFHaEJDLFNBQUcsRUFBRSxDQUhXO0FBSWhCQyxlQUFTLEVBQUUsTUFKSztBQUtoQkMsV0FBSyxFQUFFLElBTFM7QUFNaEJDLGlCQUFXLEVBQUUsT0FORztBQU9oQkMsZ0JBQVUsRUFBRSxFQVBJO0FBUWhCcVIsWUFBTSxFQUFFO0FBQ05sUixvQkFBWSxFQUFFLEVBRFI7QUFFTi9DLGNBQU0sRUFBRTtBQUZGO0FBUlEsS0FBbEI7QUFhQSxTQUFLbUssTUFBTCxDQUFZd0MsU0FBWjtBQUNEO0FBaENlLENBQWxCO0FBbUNBOEcsTUFBTSxDQUFDQyxPQUFQLEdBQWlCNkcsU0FBakIsQzs7Ozs7Ozs7Ozs7QUNuQ0EsSUFBTVEsU0FBUyxHQUFHO0FBQ2hCOVAsTUFEZ0Isa0JBQ1Q7QUFDTCxTQUFLekIsR0FBTCxDQUFTLE1BQVQ7QUFDQSxTQUFLaVIsY0FBTCxHQUFzQixNQUF0QjtBQUNBLFNBQUtDLFlBQUwsR0FBb0I7QUFDbEJDLFVBQUksRUFBRTtBQURZLEtBQXBCO0FBR0EsU0FBS0ssaUJBQUwsQ0FBdUIsT0FBdkIsRUFBZ0MsS0FBaEMsRUFBdUM7QUFBRTFGLHFCQUFlLEVBQUU7QUFBbkIsS0FBdkM7QUFDRCxHQVJlO0FBU2hCOUksT0FUZ0IsbUJBU1I7QUFDTixTQUFLaEQsR0FBTCxDQUFTLE9BQVQ7QUFDQSxTQUFLQSxHQUFMLENBQVMsS0FBSzNHLE1BQWQ7QUFDQSxTQUFLMkcsR0FBTCxDQUFTLEtBQUsxQixVQUFMLENBQWdCbVQsS0FBaEIsQ0FBc0JqUCxNQUEvQjtBQUNBLFFBQU1XLFNBQVMsR0FBRztBQUNoQnJLLGVBQVMsRUFBRSxJQUFJdUssSUFBSixHQUFXaU8sV0FETjtBQUVoQnZZLFlBQU0sRUFBRSxNQUZRO0FBR2hCQyxTQUFHLEVBQUUsQ0FIVztBQUloQkMsZUFBUyxFQUFFLE1BSks7QUFLaEJDLFdBQUssRUFBRSxLQUFLb0YsVUFBTCxDQUFnQm1ULEtBQWhCLENBQXNCalAsTUFMYjtBQU1oQnJKLGlCQUFXLEVBQUUsT0FORztBQU9oQkMsZ0JBQVUsRUFBRSxFQVBJO0FBUWhCcVIsWUFBTSxFQUFFO0FBQ05sUixvQkFBWSxFQUFFLEVBRFI7QUFFTi9DLGNBQU0sRUFBRTtBQUZGO0FBUlEsS0FBbEI7QUFhQSxTQUFLbUssTUFBTCxDQUFZd0MsU0FBWjtBQUNEO0FBM0JlLENBQWxCO0FBOEJBOEcsTUFBTSxDQUFDQyxPQUFQLEdBQWlCcUgsU0FBakIsQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDOUJBO0FBQ0E7QUFDQTtBQUtBO0FBT0E7SUFFUUcsVSxHQUErQkMsb0QsQ0FBL0JELFU7SUFBWUUsYyxHQUFtQkQsb0QsQ0FBbkJDLGM7SUFDWkMsZSxHQUFvQkQsYyxDQUFwQkMsZSxFQUVSOztBQUNBQyx1RUFBc0IsQ0FBQ25WLHVFQUFELENBQXRCO0FBQ0FtVix1RUFBc0IsQ0FBQ2pWLDZFQUFELENBQXRCO0FBRUE7Ozs7Ozs7O1NBT2U2RyxnQjs7O0FBb0JmOzs7Ozs7Ozs7Ozs7eUVBcEJBLGlCQUFnQzNHLE9BQWhDLEVBQXlDQyxLQUF6QztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUVVK1Usa0JBRlY7QUFHTTdMLDBCQUFZLEVBQUUyTCxlQUFlLENBQUNHLE1BQWhCLENBQ1pyTSx5REFBVSxDQUFDM0ksS0FBSyxDQUFDakgsUUFBUCxFQUFpQmlILEtBQUssQ0FBQ2hILEtBQXZCLEVBQThCZ0gsS0FBSyxDQUFDL0csUUFBcEMsRUFBOEMrRyxLQUFLLENBQUM5RyxTQUFwRCxDQURFLENBSHBCO0FBTU0rUCxvQkFBTSxFQUFFNEwsZUFBZSxDQUFDRyxNQUFoQixDQUF1QmhWLEtBQUssQ0FBQ2hHLE1BQTdCO0FBTmQsZUFPU2liLDZEQUFjLENBQUNqVixLQUFELENBUHZCO0FBQUE7QUFBQSxtQkFTZ0NrVixvRUFBbUIsQ0FDN0N2Vix1RUFENkMsRUFFN0NvVixNQUY2QyxDQVRuRDs7QUFBQTtBQVNVSSx5QkFUVjtBQUFBLDZDQWFXO0FBQUUxUCx1QkFBUyxFQUFFMFA7QUFBYixhQWJYOztBQUFBO0FBQUE7QUFBQTtBQWVJcFYsbUJBQU8sQ0FBQ2lELEdBQVIsQ0FBWWxKLEtBQVo7QUFmSiw2Q0FnQlc7QUFBRTJMLHVCQUFTLEVBQUUsS0FBYjtBQUFvQjNMLG1CQUFLO0FBQXpCLGFBaEJYOztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLEc7Ozs7U0EyQmVpUSxrQjs7O0FBa0JmOzs7Ozs7Ozs7Ozs7eUVBbEJBLGtCQUFrQ2hLLE9BQWxDLEVBQTJDMUQsTUFBM0M7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFFVTBZLGtCQUZWO0FBR003TCwwQkFBWSxFQUFFMkwsZUFBZSxDQUFDRyxNQUFoQixDQUF1QjNZLE1BQU0sQ0FBQ3JDLE1BQTlCLENBSHBCO0FBSU1pUCxvQkFBTSxFQUFFNEwsZUFBZSxDQUFDRyxNQUFoQixDQUF1QjNZLE1BQU0sQ0FBQzdCLEVBQVAsQ0FBVTRhLFFBQVYsRUFBdkI7QUFKZCxlQUtTSCw2REFBYyxDQUFDNVksTUFBRCxDQUx2QjtBQUFBO0FBQUEsbUJBT2dDNlksb0VBQW1CLENBQzdDclYsNkVBRDZDLEVBRTdDa1YsTUFGNkMsQ0FQbkQ7O0FBQUE7QUFPVUkseUJBUFY7QUFBQSw4Q0FXVztBQUFFMVAsdUJBQVMsRUFBRTBQLGFBQWI7QUFBNEJuYixvQkFBTSxFQUFFcUMsTUFBTSxDQUFDckM7QUFBM0MsYUFYWDs7QUFBQTtBQUFBO0FBQUE7QUFhSStGLG1CQUFPLENBQUNpRCxHQUFSLENBQVlsSixLQUFaO0FBYkosOENBY1c7QUFBRTJMLHVCQUFTLEVBQUUsS0FBYjtBQUFvQjNMLG1CQUFLO0FBQXpCLGFBZFg7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsRzs7OztTQXlCZXFQLGtCOzs7QUFhZjs7Ozs7Ozs7Ozs7O3lFQWJBLGtCQUFrQ3BKLE9BQWxDLEVBQTJDQyxLQUEzQztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUVVK1Usa0JBRlYsa0ZBR1NFLDZEQUFjLENBQUNqVixLQUFELENBSHZCO0FBQUE7QUFBQSxtQkFLZ0NxViw0REFBVyxDQUFDMVYsdUVBQUQsRUFBeUJvVixNQUF6QixDQUwzQzs7QUFBQTtBQUtVSSx5QkFMVjtBQUFBLDhDQU1XO0FBQUUxUCx1QkFBUyxFQUFFMFA7QUFBYixhQU5YOztBQUFBO0FBQUE7QUFBQTtBQVFJcFYsbUJBQU8sQ0FBQ2lELEdBQVIsQ0FBWWxKLEtBQVo7QUFSSiw4Q0FTVztBQUFFMkwsdUJBQVMsRUFBRSxLQUFiO0FBQW9CM0wsbUJBQUs7QUFBekIsYUFUWDs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxHOzs7O1NBb0Jld2Isb0I7OztBQWtCZjs7Ozs7Ozs7Ozs7O3lFQWxCQSxrQkFBb0N2VixPQUFwQyxFQUE2QzFELE1BQTdDO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBRVUwWSxrQkFGVjtBQUdNN0wsMEJBQVksRUFBRTJMLGVBQWUsQ0FBQ0csTUFBaEIsQ0FBdUIzWSxNQUFNLENBQUNyQyxNQUE5QixDQUhwQjtBQUlNaVAsb0JBQU0sRUFBRTRMLGVBQWUsQ0FBQ0csTUFBaEIsQ0FBdUIzWSxNQUFNLENBQUM3QixFQUFQLENBQVU0YSxRQUFWLEVBQXZCO0FBSmQsZUFLU0gsNkRBQWMsQ0FBQzVZLE1BQUQsQ0FMdkI7QUFBQTtBQUFBLG1CQU9nQ2taLDZEQUFZLENBQ3RDMVYsNkVBRHNDLEVBRXRDa1YsTUFGc0MsQ0FQNUM7O0FBQUE7QUFPVVMseUJBUFY7QUFBQSw4Q0FXVztBQUFFL1AsdUJBQVMsRUFBRStQO0FBQWIsYUFYWDs7QUFBQTtBQUFBO0FBQUE7QUFhSXpWLG1CQUFPLENBQUNpRCxHQUFSLENBQVlsSixLQUFaO0FBYkosOENBY1c7QUFBRTJMLHVCQUFTLEVBQUUsS0FBYjtBQUFvQjNMLG1CQUFLO0FBQXpCLGFBZFg7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsRzs7OztTQXlCZStPLGU7OztBQWlDZjs7Ozs7Ozs7Ozs7O3lFQWpDQSxrQkFBK0I5SSxPQUEvQixFQUF3Q2dFLElBQXhDO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBRVUwUix3QkFGVixHQUV5QmYsVUFBVSxDQUFDZ0IsWUFBWCxDQUNuQixRQURtQixFQUVuQmQsY0FBYyxDQUFDZSxnQkFBZixDQUFnQ0MsS0FGYixFQUduQjdSLElBQUksQ0FBQzVHLE1BSGMsQ0FGekI7QUFPVTBZLDhCQVBWLEdBTytCbkIsVUFBVSxDQUFDZ0IsWUFBWCxDQUN6QixjQUR5QixFQUV6QmQsY0FBYyxDQUFDZSxnQkFBZixDQUFnQ0MsS0FGUCxFQUd6QjdSLElBQUksQ0FBQzNHLFlBSG9CLENBUC9CO0FBWVUwWSxpQkFaVixHQVlrQixJQUFJcEIsVUFBSixHQUFpQnFCLEtBQWpCLENBQ1pyQixVQUFVLENBQUNzQixjQUFYLENBQ0VQLFlBREYsRUFFRWIsY0FBYyxDQUFDcUIsY0FBZixDQUE4QkMsR0FGaEMsRUFHRUwsa0JBSEYsQ0FEWSxDQVpsQjtBQUFBO0FBQUEsbUJBbUJ5Qk0sOERBQWEsQ0FBQ3hXLHVFQUFELEVBQXlCbVcsS0FBekIsQ0FuQnRDOztBQUFBO0FBbUJVdFEsa0JBbkJWO0FBb0JVNFEsb0JBcEJWLEdBb0JxQixFQXBCckI7O0FBcUJJLGdCQUFJNVEsTUFBSixFQUFZO0FBQ1ZBLG9CQUFNLENBQUM2USxPQUFQLENBQWU3UyxPQUFmLENBQXVCLFVBQUE4UyxPQUFPLEVBQUk7QUFDaENGLHdCQUFRLENBQUN6USxJQUFULENBQWM0USw2REFBYyxDQUFDRCxPQUFELENBQTVCO0FBQ0QsZUFGRDtBQUdEOztBQXpCTCw4Q0EwQlc7QUFBRTdRLHVCQUFTLEVBQUUsSUFBYjtBQUFtQjlLLGtCQUFJLEVBQUV5YixRQUFRLENBQUMsQ0FBRDtBQUFqQyxhQTFCWDs7QUFBQTtBQUFBO0FBQUE7QUE0QklyVyxtQkFBTyxDQUFDaUQsR0FBUixDQUFZbEosS0FBWixlQUF5QmlLLElBQXpCO0FBNUJKLDhDQTZCVztBQUFFMEIsdUJBQVMsRUFBRSxLQUFiO0FBQW9CM0wsbUJBQUs7QUFBekIsYUE3Qlg7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsRzs7OztTQXdDZTBQLGlCOzs7QUEyQ2Y7Ozs7Ozs7Ozs7Ozt5RUEzQ0Esa0JBQWlDekosT0FBakMsRUFBMEN3SixJQUExQztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUVVc00sOEJBRlYsR0FFK0JuQixVQUFVLENBQUNnQixZQUFYLENBQ3pCLGNBRHlCLEVBRXpCZCxjQUFjLENBQUNlLGdCQUFmLENBQWdDQyxLQUZQLEVBR3pCck0sSUFIeUIsQ0FGL0I7QUFPVWlOLCtCQVBWLEdBT2dDOUIsVUFBVSxDQUFDZ0IsWUFBWCxDQUMxQixRQUQwQixFQUUxQmQsY0FBYyxDQUFDZSxnQkFBZixDQUFnQ0MsS0FGTixFQUcxQnZXLHVEQUgwQixDQVBoQztBQVlVb1gsNEJBWlYsR0FZNkIvQixVQUFVLENBQUNnQixZQUFYLENBQ3ZCLFFBRHVCLEVBRXZCZCxjQUFjLENBQUNlLGdCQUFmLENBQWdDQyxLQUZULEVBR3ZCclcsb0RBSHVCLENBWjdCO0FBaUJVbVgsd0JBakJWLEdBaUJ5QmhDLFVBQVUsQ0FBQ3NCLGNBQVgsQ0FDbkJRLG1CQURtQixFQUVuQjVCLGNBQWMsQ0FBQ3FCLGNBQWYsQ0FBOEJVLEVBRlgsRUFHbkJGLGdCQUhtQixDQWpCekI7QUFzQlVYLGlCQXRCVixHQXNCa0IsSUFBSXBCLFVBQUosR0FBaUJxQixLQUFqQixDQUNackIsVUFBVSxDQUFDc0IsY0FBWCxDQUNFSCxrQkFERixFQUVFakIsY0FBYyxDQUFDcUIsY0FBZixDQUE4QkMsR0FGaEMsRUFHRVEsWUFIRixDQURZLENBdEJsQjtBQUFBO0FBQUEsbUJBNkJ5QlAsOERBQWEsQ0FBQ3hXLHVFQUFELEVBQXlCbVcsS0FBekIsQ0E3QnRDOztBQUFBO0FBNkJVdFEsa0JBN0JWO0FBOEJVNFEsb0JBOUJWLEdBOEJxQixFQTlCckI7O0FBK0JJLGdCQUFJNVEsTUFBSixFQUFZO0FBQ1ZBLG9CQUFNLENBQUM2USxPQUFQLENBQWU3UyxPQUFmLENBQXVCLFVBQUE4UyxPQUFPLEVBQUk7QUFDaENGLHdCQUFRLENBQUN6USxJQUFULENBQWM0USw2REFBYyxDQUFDRCxPQUFELENBQTVCO0FBQ0QsZUFGRDtBQUdEOztBQW5DTCw4Q0FvQ1c7QUFBRTdRLHVCQUFTLEVBQUUsSUFBYjtBQUFtQjlLLGtCQUFJLEVBQUV5YjtBQUF6QixhQXBDWDs7QUFBQTtBQUFBO0FBQUE7QUFzQ0lyVyxtQkFBTyxDQUFDaUQsR0FBUixDQUFZbEosS0FBWixlQUF5QnlQLElBQXpCO0FBdENKLDhDQXVDVztBQUFFOUQsdUJBQVMsRUFBRSxLQUFiO0FBQW9CM0wsbUJBQUs7QUFBekIsYUF2Q1g7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsRzs7OztTQWtEZXlMLHFCOzs7QUF5QmY7Ozs7Ozs7Ozs7Ozt5RUF6QkEsa0JBQXFDeEYsT0FBckMsRUFBOEN3RCxHQUE5QyxFQUFtRHFULEtBQW5EO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBRVVkLGlCQUZWLEdBRWtCLElBQUlwQixVQUFKLEdBQ1hxQixLQURXLENBRVZyQixVQUFVLENBQUNnQixZQUFYLENBQ0UsY0FERixFQUVFZCxjQUFjLENBQUNlLGdCQUFmLENBQWdDQyxLQUZsQyxFQUdFclMsR0FIRixDQUZVLEVBUVhzVCxHQVJXLENBUVBELEtBUk8sQ0FGbEI7QUFBQTtBQUFBLG1CQVd5QlQsOERBQWEsQ0FBQ3ZXLDRFQUFELEVBQThCa1csS0FBOUIsQ0FYdEM7O0FBQUE7QUFXVXRRLGtCQVhWO0FBWVU0USxvQkFaVixHQVlxQixFQVpyQjs7QUFhSSxnQkFBSTVRLE1BQUosRUFBWTtBQUNWQSxvQkFBTSxDQUFDNlEsT0FBUCxDQUFlN1MsT0FBZixDQUF1QixVQUFBOFMsT0FBTyxFQUFJO0FBQ2hDRix3QkFBUSxDQUFDelEsSUFBVCxDQUFjNFEsNkRBQWMsQ0FBQ0QsT0FBRCxDQUE1QjtBQUNELGVBRkQ7QUFHRDs7QUFqQkwsOENBa0JXO0FBQUU3USx1QkFBUyxFQUFFLElBQWI7QUFBbUI5SyxrQkFBSSxFQUFFeWI7QUFBekIsYUFsQlg7O0FBQUE7QUFBQTtBQUFBO0FBb0JJclcsbUJBQU8sQ0FBQ2lELEdBQVIsQ0FBWWxKLEtBQVosZUFBeUJ5SixHQUF6QjtBQXBCSiw4Q0FxQlc7QUFBRWtDLHVCQUFTLEVBQUUsS0FBYjtBQUFvQjNMLG1CQUFLO0FBQXpCLGFBckJYOztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLEc7Ozs7U0FnQ2VnZCw0Qjs7Ozs7Ozt5RUFBZixrQkFBNEMvVyxPQUE1QyxFQUFxRHZGLEVBQXJEO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBRVVzYixpQkFGVixHQUVrQixJQUFJcEIsVUFBSixHQUFpQnFCLEtBQWpCLENBQ1pyQixVQUFVLENBQUNnQixZQUFYLENBQ0UsY0FERixFQUVFZCxjQUFjLENBQUNlLGdCQUFmLENBQWdDQyxLQUZsQyxFQUdFcGIsRUFIRixDQURZLENBRmxCO0FBQUE7QUFBQSxtQkFTeUIyYiw4REFBYSxDQUFDdFcsNkVBQUQsRUFBK0JpVyxLQUEvQixDQVR0Qzs7QUFBQTtBQVNVdFEsa0JBVFY7QUFVVTRRLG9CQVZWLEdBVXFCLEVBVnJCOztBQVdJLGdCQUFJNVEsTUFBSixFQUFZO0FBQ1ZBLG9CQUFNLENBQUM2USxPQUFQLENBQWU3UyxPQUFmLENBQXVCLFVBQUE4UyxPQUFPLEVBQUk7QUFDaENGLHdCQUFRLENBQUN6USxJQUFULENBQWM0USw2REFBYyxDQUFDRCxPQUFELENBQTVCO0FBQ0QsZUFGRDtBQUdEOztBQWZMLDhDQWdCVztBQUFFN1EsdUJBQVMsRUFBRSxJQUFiO0FBQW1COUssa0JBQUksRUFBRXliO0FBQXpCLGFBaEJYOztBQUFBO0FBQUE7QUFBQTtBQWtCSXJXLG1CQUFPLENBQUNpRCxHQUFSLENBQVlsSixLQUFaLGVBQXlCVSxFQUF6QjtBQWxCSiw4Q0FtQlc7QUFBRWlMLHVCQUFTLEVBQUUsS0FBYjtBQUFvQjNMLG1CQUFLO0FBQXpCLGFBbkJYOztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLEc7Ozs7Ozs7Ozs7Ozs7Ozs7QUN6UEE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQ0E7QUFFQSxJQUFNaWQsWUFBWSxHQUFHcEMsb0RBQUssQ0FBQ3FDLGtCQUFOLENBQXlCL0wsT0FBTyxDQUFDQyxHQUFSLENBQVkrTCxhQUFyQyxDQUFyQjtBQUNBOzs7Ozs7O0FBTUEsU0FBU25DLHNCQUFULENBQWdDb0MsU0FBaEMsRUFBMkM7QUFDekMsU0FBTyxJQUFJdlMsT0FBSixDQUFZLFVBQUM2QyxPQUFELEVBQVUyUCxNQUFWLEVBQXFCO0FBQ3RDSixnQkFBWSxDQUFDakMsc0JBQWIsQ0FBb0NvQyxTQUFwQyxFQUErQyxVQUFDcGQsS0FBRCxFQUFRMEwsTUFBUixFQUFtQjtBQUNoRSxVQUFJMUwsS0FBSixFQUFXcWQsTUFBTSxDQUFDcmQsS0FBRCxDQUFOO0FBRVgwTixhQUFPLENBQUNoQyxNQUFELENBQVA7QUFDRCxLQUpEO0FBS0QsR0FOTSxDQUFQO0FBT0Q7QUFFRDs7Ozs7Ozs7O0FBT0EsU0FBUzBQLG1CQUFULENBQTZCZ0MsU0FBN0IsRUFBd0NuQyxNQUF4QyxFQUFnRDtBQUM5QyxTQUFPLElBQUlwUSxPQUFKLENBQVksVUFBQzZDLE9BQUQsRUFBVTJQLE1BQVYsRUFBcUI7QUFDdENKLGdCQUFZLENBQUM3QixtQkFBYixDQUFpQ2dDLFNBQWpDLEVBQTRDbkMsTUFBNUMsRUFBb0QsVUFBQWpiLEtBQUssRUFBSTtBQUMzRCxVQUFJQSxLQUFKLEVBQVdxZCxNQUFNLENBQUNyZCxLQUFELENBQU47QUFDWDBOLGFBQU8sQ0FBQyxJQUFELENBQVA7QUFDRCxLQUhEO0FBSUQsR0FMTSxDQUFQO0FBTUQ7QUFFRDs7Ozs7Ozs7O0FBT0EsU0FBUzZOLFdBQVQsQ0FBcUI2QixTQUFyQixFQUFnQ25DLE1BQWhDLEVBQXdDO0FBQ3RDLFNBQU8sSUFBSXBRLE9BQUosQ0FBWSxVQUFDNkMsT0FBRCxFQUFVMlAsTUFBVixFQUFxQjtBQUN0Q0osZ0JBQVksQ0FBQzFCLFdBQWIsQ0FBeUI2QixTQUF6QixFQUFvQ25DLE1BQXBDLEVBQTRDLFVBQUFqYixLQUFLLEVBQUk7QUFDbkQsVUFBSUEsS0FBSixFQUFXcWQsTUFBTSxDQUFDcmQsS0FBRCxDQUFOO0FBQ1gwTixhQUFPLENBQUMsSUFBRCxDQUFQO0FBQ0QsS0FIRDtBQUlELEdBTE0sQ0FBUDtBQU1EO0FBRUQ7Ozs7Ozs7OztBQU9BLFNBQVMrTixZQUFULENBQXNCMkIsU0FBdEIsRUFBaUNuQyxNQUFqQyxFQUF5QztBQUN2QyxTQUFPLElBQUlwUSxPQUFKLENBQVksVUFBQzZDLE9BQUQsRUFBVTJQLE1BQVYsRUFBcUI7QUFDdENKLGdCQUFZLENBQUN4QixZQUFiLENBQTBCMkIsU0FBMUIsRUFBcUNuQyxNQUFyQyxFQUE2QyxVQUFBamIsS0FBSyxFQUFJO0FBQ3BELFVBQUlBLEtBQUosRUFBV3FkLE1BQU0sQ0FBQ3JkLEtBQUQsQ0FBTjtBQUNYME4sYUFBTyxDQUFDLElBQUQsQ0FBUDtBQUNELEtBSEQ7QUFJRCxHQUxNLENBQVA7QUFNRDtBQUNEOzs7Ozs7Ozs7QUFPQSxTQUFTMk8sYUFBVCxDQUF1QmUsU0FBdkIsRUFBa0NFLFVBQWxDLEVBQThDO0FBQzVDLFNBQU8sSUFBSXpTLE9BQUosQ0FBWSxVQUFDNkMsT0FBRCxFQUFVMlAsTUFBVixFQUFxQjtBQUN0Q0osZ0JBQVksQ0FBQ1osYUFBYixDQUEyQmUsU0FBM0IsRUFBc0NFLFVBQXRDLEVBQWtELElBQWxELEVBQXdELFVBQUN0ZCxLQUFELEVBQVEwTCxNQUFSLEVBQW1CO0FBQ3pFLFVBQUkxTCxLQUFKLEVBQVdxZCxNQUFNLENBQUNyZCxLQUFELENBQU47QUFDWDBOLGFBQU8sQ0FBQ2hDLE1BQUQsQ0FBUDtBQUNELEtBSEQ7QUFJRCxHQUxNLENBQVA7QUFNRDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDakZEO0lBRVFxUCxlLEdBQW9CRCw0RCxDQUFwQkMsZTs7QUFFUixTQUFTd0MsWUFBVCxDQUFzQkMsVUFBdEIsRUFBa0M7QUFDaEMsTUFBSTtBQUNGLFFBQU1DLENBQUMsR0FBR3RVLElBQUksQ0FBQzJILEtBQUwsQ0FBVzBNLFVBQVgsQ0FBVjs7QUFDQSxRQUFJQyxDQUFDLElBQUkscUVBQU9BLENBQVAsTUFBYSxRQUF0QixFQUFnQztBQUM5QixhQUFPQSxDQUFQO0FBQ0Q7QUFDRixHQUxELENBS0UsT0FBT0MsQ0FBUCxFQUFVO0FBQ1YsV0FBTyxLQUFQO0FBQ0Q7O0FBQ0QsU0FBTyxLQUFQO0FBQ0Q7QUFDRDs7Ozs7Ozs7QUFNQSxTQUFTakIsY0FBVCxDQUF3QnhCLE1BQXhCLEVBQWdDO0FBQzlCLE1BQU0wQyxNQUFNLEdBQUcsRUFBZjtBQUNBclUsUUFBTSxDQUFDVyxJQUFQLENBQVlnUixNQUFaLEVBQW9CdlIsT0FBcEIsQ0FBNEIsVUFBQUQsR0FBRyxFQUFJO0FBQ2pDLFFBQUlBLEdBQUcsS0FBSyxXQUFaLEVBQXlCO0FBQ3pCLFFBQU1tVSxJQUFJLEdBQUdMLFlBQVksQ0FBQ3RDLE1BQU0sQ0FBQ3hSLEdBQUQsQ0FBTixDQUFZb1UsQ0FBYixDQUF6Qjs7QUFDQSxRQUFJRCxJQUFKLEVBQVU7QUFDUkQsWUFBTSxDQUFDbFUsR0FBRCxDQUFOLEdBQWNtVSxJQUFkO0FBQ0QsS0FGRCxNQUVPO0FBQ0xELFlBQU0sQ0FBQ2xVLEdBQUQsQ0FBTixHQUFjd1IsTUFBTSxDQUFDeFIsR0FBRCxDQUFOLENBQVlvVSxDQUExQjtBQUNEO0FBQ0YsR0FSRDtBQVNBLFNBQU9GLE1BQVA7QUFDRDtBQUNEOzs7Ozs7OztBQU1BLFNBQVN4QyxjQUFULENBQXdCd0MsTUFBeEIsRUFBZ0M7QUFDOUIsTUFBTTFDLE1BQU0sR0FBRyxFQUFmO0FBQ0EzUixRQUFNLENBQUNXLElBQVAsQ0FBWTBULE1BQVosRUFBb0JqVSxPQUFwQixDQUE0QixVQUFBRCxHQUFHLEVBQUk7QUFDakMsUUFBTStTLE9BQU8sR0FBR21CLE1BQU0sQ0FBQ2xVLEdBQUQsQ0FBdEI7O0FBQ0EsUUFBSSxxRUFBTytTLE9BQVAsTUFBbUIsUUFBdkIsRUFBaUM7QUFDL0IsVUFBSUEsT0FBTyxZQUFZalEsSUFBdkIsRUFBNkI7QUFDM0IwTyxjQUFNLENBQUN4UixHQUFELENBQU4sR0FBY3NSLGVBQWUsQ0FBQytDLFFBQWhCLENBQXlCdEIsT0FBekIsQ0FBZDtBQUNELE9BRkQsTUFFTztBQUNMdkIsY0FBTSxDQUFDeFIsR0FBRCxDQUFOLEdBQWNzUixlQUFlLENBQUNHLE1BQWhCLENBQXVCL1IsSUFBSSxDQUFDQyxTQUFMLENBQWVvVCxPQUFmLENBQXZCLENBQWQ7QUFDRDtBQUNGLEtBTkQsTUFNTyxJQUFJLE9BQU9BLE9BQVAsS0FBbUIsUUFBdkIsRUFBaUM7QUFDdEN2QixZQUFNLENBQUN4UixHQUFELENBQU4sR0FBY3NSLGVBQWUsQ0FBQ2dELE1BQWhCLENBQXVCdkIsT0FBdkIsQ0FBZDtBQUNELEtBRk0sTUFFQSxJQUFJLE9BQU9BLE9BQVAsS0FBbUIsU0FBdkIsRUFBa0M7QUFDdkN2QixZQUFNLENBQUN4UixHQUFELENBQU4sR0FBY3NSLGVBQWUsQ0FBQ2lELE9BQWhCLENBQXdCeEIsT0FBeEIsQ0FBZDtBQUNELEtBRk0sTUFFQTtBQUNMdkIsWUFBTSxDQUFDeFIsR0FBRCxDQUFOLEdBQWNzUixlQUFlLENBQUNHLE1BQWhCLENBQXVCc0IsT0FBdkIsQ0FBZDtBQUNEO0FBQ0YsR0FmRDtBQWdCQSxTQUFPdkIsTUFBUDtBQUNEOztBQUVELFNBQVNwTSxVQUFULENBQW9CNVAsUUFBcEIsRUFBOEJDLEtBQTlCLEVBQXFDQyxRQUFyQyxFQUErQ0MsU0FBL0MsRUFBMEQ7QUFDeEQsbUJBQVVILFFBQVYsY0FBc0JDLEtBQXRCLGNBQStCQyxRQUEvQixjQUEyQ0MsU0FBM0M7QUFDRDs7Ozs7Ozs7Ozs7OztBQy9ERCxvRTs7Ozs7Ozs7Ozs7QUNBQSxrRTs7Ozs7Ozs7Ozs7QUNBQSwrRDs7Ozs7Ozs7Ozs7QUNBQSxrRTs7Ozs7Ozs7Ozs7QUNBQSw0RDs7Ozs7Ozs7Ozs7QUNBQSxnRTs7Ozs7Ozs7Ozs7QUNBQSw2RTs7Ozs7Ozs7Ozs7QUNBQSwwRDs7Ozs7Ozs7Ozs7QUNBQSx1RDs7Ozs7Ozs7Ozs7QUNBQSw0Qzs7Ozs7Ozs7Ozs7QUNBQSwwQzs7Ozs7Ozs7Ozs7QUNBQSxrQzs7Ozs7Ozs7Ozs7QUNBQSwwQzs7Ozs7Ozs7Ozs7QUNBQSxtQzs7Ozs7Ozs7Ozs7QUNBQSxnQzs7Ozs7Ozs7Ozs7QUNBQSxpQyIsImZpbGUiOiJmdW5jVGFza0V2ZW50cy5qcyIsInNvdXJjZXNDb250ZW50IjpbIiBcdC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby11bnVzZWQtdmFyc1xuIFx0ZnVuY3Rpb24gaG90RG93bmxvYWRVcGRhdGVDaHVuayhjaHVua0lkKSB7XG4gXHRcdHZhciBjaHVuayA9IHJlcXVpcmUoXCIuL1wiICsgXCJcIiArIGNodW5rSWQgKyBcIi5cIiArIGhvdEN1cnJlbnRIYXNoICsgXCIuaG90LXVwZGF0ZS5qc1wiKTtcbiBcdFx0aG90QWRkVXBkYXRlQ2h1bmsoY2h1bmsuaWQsIGNodW5rLm1vZHVsZXMpO1xuIFx0fVxuXG4gXHQvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tdW51c2VkLXZhcnNcbiBcdGZ1bmN0aW9uIGhvdERvd25sb2FkTWFuaWZlc3QoKSB7XG4gXHRcdHRyeSB7XG4gXHRcdFx0dmFyIHVwZGF0ZSA9IHJlcXVpcmUoXCIuL1wiICsgXCJcIiArIGhvdEN1cnJlbnRIYXNoICsgXCIuaG90LXVwZGF0ZS5qc29uXCIpO1xuIFx0XHR9IGNhdGNoIChlKSB7XG4gXHRcdFx0cmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuIFx0XHR9XG4gXHRcdHJldHVybiBQcm9taXNlLnJlc29sdmUodXBkYXRlKTtcbiBcdH1cblxuIFx0Ly9lc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tdW51c2VkLXZhcnNcbiBcdGZ1bmN0aW9uIGhvdERpc3Bvc2VDaHVuayhjaHVua0lkKSB7XG4gXHRcdGRlbGV0ZSBpbnN0YWxsZWRDaHVua3NbY2h1bmtJZF07XG4gXHR9XG5cbiBcdHZhciBob3RBcHBseU9uVXBkYXRlID0gdHJ1ZTtcbiBcdC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby11bnVzZWQtdmFyc1xuIFx0dmFyIGhvdEN1cnJlbnRIYXNoID0gXCJmYjIwYWVlNjIzYjE0MGQwODQ5MFwiO1xuIFx0dmFyIGhvdFJlcXVlc3RUaW1lb3V0ID0gMTAwMDA7XG4gXHR2YXIgaG90Q3VycmVudE1vZHVsZURhdGEgPSB7fTtcbiBcdHZhciBob3RDdXJyZW50Q2hpbGRNb2R1bGU7XG4gXHQvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tdW51c2VkLXZhcnNcbiBcdHZhciBob3RDdXJyZW50UGFyZW50cyA9IFtdO1xuIFx0Ly8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXVudXNlZC12YXJzXG4gXHR2YXIgaG90Q3VycmVudFBhcmVudHNUZW1wID0gW107XG5cbiBcdC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby11bnVzZWQtdmFyc1xuIFx0ZnVuY3Rpb24gaG90Q3JlYXRlUmVxdWlyZShtb2R1bGVJZCkge1xuIFx0XHR2YXIgbWUgPSBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXTtcbiBcdFx0aWYgKCFtZSkgcmV0dXJuIF9fd2VicGFja19yZXF1aXJlX187XG4gXHRcdHZhciBmbiA9IGZ1bmN0aW9uKHJlcXVlc3QpIHtcbiBcdFx0XHRpZiAobWUuaG90LmFjdGl2ZSkge1xuIFx0XHRcdFx0aWYgKGluc3RhbGxlZE1vZHVsZXNbcmVxdWVzdF0pIHtcbiBcdFx0XHRcdFx0aWYgKGluc3RhbGxlZE1vZHVsZXNbcmVxdWVzdF0ucGFyZW50cy5pbmRleE9mKG1vZHVsZUlkKSA9PT0gLTEpIHtcbiBcdFx0XHRcdFx0XHRpbnN0YWxsZWRNb2R1bGVzW3JlcXVlc3RdLnBhcmVudHMucHVzaChtb2R1bGVJZCk7XG4gXHRcdFx0XHRcdH1cbiBcdFx0XHRcdH0gZWxzZSB7XG4gXHRcdFx0XHRcdGhvdEN1cnJlbnRQYXJlbnRzID0gW21vZHVsZUlkXTtcbiBcdFx0XHRcdFx0aG90Q3VycmVudENoaWxkTW9kdWxlID0gcmVxdWVzdDtcbiBcdFx0XHRcdH1cbiBcdFx0XHRcdGlmIChtZS5jaGlsZHJlbi5pbmRleE9mKHJlcXVlc3QpID09PSAtMSkge1xuIFx0XHRcdFx0XHRtZS5jaGlsZHJlbi5wdXNoKHJlcXVlc3QpO1xuIFx0XHRcdFx0fVxuIFx0XHRcdH0gZWxzZSB7XG4gXHRcdFx0XHRjb25zb2xlLndhcm4oXG4gXHRcdFx0XHRcdFwiW0hNUl0gdW5leHBlY3RlZCByZXF1aXJlKFwiICtcbiBcdFx0XHRcdFx0XHRyZXF1ZXN0ICtcbiBcdFx0XHRcdFx0XHRcIikgZnJvbSBkaXNwb3NlZCBtb2R1bGUgXCIgK1xuIFx0XHRcdFx0XHRcdG1vZHVsZUlkXG4gXHRcdFx0XHQpO1xuIFx0XHRcdFx0aG90Q3VycmVudFBhcmVudHMgPSBbXTtcbiBcdFx0XHR9XG4gXHRcdFx0cmV0dXJuIF9fd2VicGFja19yZXF1aXJlX18ocmVxdWVzdCk7XG4gXHRcdH07XG4gXHRcdHZhciBPYmplY3RGYWN0b3J5ID0gZnVuY3Rpb24gT2JqZWN0RmFjdG9yeShuYW1lKSB7XG4gXHRcdFx0cmV0dXJuIHtcbiBcdFx0XHRcdGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiBcdFx0XHRcdGVudW1lcmFibGU6IHRydWUsXG4gXHRcdFx0XHRnZXQ6IGZ1bmN0aW9uKCkge1xuIFx0XHRcdFx0XHRyZXR1cm4gX193ZWJwYWNrX3JlcXVpcmVfX1tuYW1lXTtcbiBcdFx0XHRcdH0sXG4gXHRcdFx0XHRzZXQ6IGZ1bmN0aW9uKHZhbHVlKSB7XG4gXHRcdFx0XHRcdF9fd2VicGFja19yZXF1aXJlX19bbmFtZV0gPSB2YWx1ZTtcbiBcdFx0XHRcdH1cbiBcdFx0XHR9O1xuIFx0XHR9O1xuIFx0XHRmb3IgKHZhciBuYW1lIGluIF9fd2VicGFja19yZXF1aXJlX18pIHtcbiBcdFx0XHRpZiAoXG4gXHRcdFx0XHRPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoX193ZWJwYWNrX3JlcXVpcmVfXywgbmFtZSkgJiZcbiBcdFx0XHRcdG5hbWUgIT09IFwiZVwiICYmXG4gXHRcdFx0XHRuYW1lICE9PSBcInRcIlxuIFx0XHRcdCkge1xuIFx0XHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGZuLCBuYW1lLCBPYmplY3RGYWN0b3J5KG5hbWUpKTtcbiBcdFx0XHR9XG4gXHRcdH1cbiBcdFx0Zm4uZSA9IGZ1bmN0aW9uKGNodW5rSWQpIHtcbiBcdFx0XHRpZiAoaG90U3RhdHVzID09PSBcInJlYWR5XCIpIGhvdFNldFN0YXR1cyhcInByZXBhcmVcIik7XG4gXHRcdFx0aG90Q2h1bmtzTG9hZGluZysrO1xuIFx0XHRcdHJldHVybiBfX3dlYnBhY2tfcmVxdWlyZV9fLmUoY2h1bmtJZCkudGhlbihmaW5pc2hDaHVua0xvYWRpbmcsIGZ1bmN0aW9uKGVycikge1xuIFx0XHRcdFx0ZmluaXNoQ2h1bmtMb2FkaW5nKCk7XG4gXHRcdFx0XHR0aHJvdyBlcnI7XG4gXHRcdFx0fSk7XG5cbiBcdFx0XHRmdW5jdGlvbiBmaW5pc2hDaHVua0xvYWRpbmcoKSB7XG4gXHRcdFx0XHRob3RDaHVua3NMb2FkaW5nLS07XG4gXHRcdFx0XHRpZiAoaG90U3RhdHVzID09PSBcInByZXBhcmVcIikge1xuIFx0XHRcdFx0XHRpZiAoIWhvdFdhaXRpbmdGaWxlc01hcFtjaHVua0lkXSkge1xuIFx0XHRcdFx0XHRcdGhvdEVuc3VyZVVwZGF0ZUNodW5rKGNodW5rSWQpO1xuIFx0XHRcdFx0XHR9XG4gXHRcdFx0XHRcdGlmIChob3RDaHVua3NMb2FkaW5nID09PSAwICYmIGhvdFdhaXRpbmdGaWxlcyA9PT0gMCkge1xuIFx0XHRcdFx0XHRcdGhvdFVwZGF0ZURvd25sb2FkZWQoKTtcbiBcdFx0XHRcdFx0fVxuIFx0XHRcdFx0fVxuIFx0XHRcdH1cbiBcdFx0fTtcbiBcdFx0Zm4udCA9IGZ1bmN0aW9uKHZhbHVlLCBtb2RlKSB7XG4gXHRcdFx0aWYgKG1vZGUgJiAxKSB2YWx1ZSA9IGZuKHZhbHVlKTtcbiBcdFx0XHRyZXR1cm4gX193ZWJwYWNrX3JlcXVpcmVfXy50KHZhbHVlLCBtb2RlICYgfjEpO1xuIFx0XHR9O1xuIFx0XHRyZXR1cm4gZm47XG4gXHR9XG5cbiBcdC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby11bnVzZWQtdmFyc1xuIFx0ZnVuY3Rpb24gaG90Q3JlYXRlTW9kdWxlKG1vZHVsZUlkKSB7XG4gXHRcdHZhciBob3QgPSB7XG4gXHRcdFx0Ly8gcHJpdmF0ZSBzdHVmZlxuIFx0XHRcdF9hY2NlcHRlZERlcGVuZGVuY2llczoge30sXG4gXHRcdFx0X2RlY2xpbmVkRGVwZW5kZW5jaWVzOiB7fSxcbiBcdFx0XHRfc2VsZkFjY2VwdGVkOiBmYWxzZSxcbiBcdFx0XHRfc2VsZkRlY2xpbmVkOiBmYWxzZSxcbiBcdFx0XHRfZGlzcG9zZUhhbmRsZXJzOiBbXSxcbiBcdFx0XHRfbWFpbjogaG90Q3VycmVudENoaWxkTW9kdWxlICE9PSBtb2R1bGVJZCxcblxuIFx0XHRcdC8vIE1vZHVsZSBBUElcbiBcdFx0XHRhY3RpdmU6IHRydWUsXG4gXHRcdFx0YWNjZXB0OiBmdW5jdGlvbihkZXAsIGNhbGxiYWNrKSB7XG4gXHRcdFx0XHRpZiAoZGVwID09PSB1bmRlZmluZWQpIGhvdC5fc2VsZkFjY2VwdGVkID0gdHJ1ZTtcbiBcdFx0XHRcdGVsc2UgaWYgKHR5cGVvZiBkZXAgPT09IFwiZnVuY3Rpb25cIikgaG90Ll9zZWxmQWNjZXB0ZWQgPSBkZXA7XG4gXHRcdFx0XHRlbHNlIGlmICh0eXBlb2YgZGVwID09PSBcIm9iamVjdFwiKVxuIFx0XHRcdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IGRlcC5sZW5ndGg7IGkrKylcbiBcdFx0XHRcdFx0XHRob3QuX2FjY2VwdGVkRGVwZW5kZW5jaWVzW2RlcFtpXV0gPSBjYWxsYmFjayB8fCBmdW5jdGlvbigpIHt9O1xuIFx0XHRcdFx0ZWxzZSBob3QuX2FjY2VwdGVkRGVwZW5kZW5jaWVzW2RlcF0gPSBjYWxsYmFjayB8fCBmdW5jdGlvbigpIHt9O1xuIFx0XHRcdH0sXG4gXHRcdFx0ZGVjbGluZTogZnVuY3Rpb24oZGVwKSB7XG4gXHRcdFx0XHRpZiAoZGVwID09PSB1bmRlZmluZWQpIGhvdC5fc2VsZkRlY2xpbmVkID0gdHJ1ZTtcbiBcdFx0XHRcdGVsc2UgaWYgKHR5cGVvZiBkZXAgPT09IFwib2JqZWN0XCIpXG4gXHRcdFx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgZGVwLmxlbmd0aDsgaSsrKVxuIFx0XHRcdFx0XHRcdGhvdC5fZGVjbGluZWREZXBlbmRlbmNpZXNbZGVwW2ldXSA9IHRydWU7XG4gXHRcdFx0XHRlbHNlIGhvdC5fZGVjbGluZWREZXBlbmRlbmNpZXNbZGVwXSA9IHRydWU7XG4gXHRcdFx0fSxcbiBcdFx0XHRkaXNwb3NlOiBmdW5jdGlvbihjYWxsYmFjaykge1xuIFx0XHRcdFx0aG90Ll9kaXNwb3NlSGFuZGxlcnMucHVzaChjYWxsYmFjayk7XG4gXHRcdFx0fSxcbiBcdFx0XHRhZGREaXNwb3NlSGFuZGxlcjogZnVuY3Rpb24oY2FsbGJhY2spIHtcbiBcdFx0XHRcdGhvdC5fZGlzcG9zZUhhbmRsZXJzLnB1c2goY2FsbGJhY2spO1xuIFx0XHRcdH0sXG4gXHRcdFx0cmVtb3ZlRGlzcG9zZUhhbmRsZXI6IGZ1bmN0aW9uKGNhbGxiYWNrKSB7XG4gXHRcdFx0XHR2YXIgaWR4ID0gaG90Ll9kaXNwb3NlSGFuZGxlcnMuaW5kZXhPZihjYWxsYmFjayk7XG4gXHRcdFx0XHRpZiAoaWR4ID49IDApIGhvdC5fZGlzcG9zZUhhbmRsZXJzLnNwbGljZShpZHgsIDEpO1xuIFx0XHRcdH0sXG5cbiBcdFx0XHQvLyBNYW5hZ2VtZW50IEFQSVxuIFx0XHRcdGNoZWNrOiBob3RDaGVjayxcbiBcdFx0XHRhcHBseTogaG90QXBwbHksXG4gXHRcdFx0c3RhdHVzOiBmdW5jdGlvbihsKSB7XG4gXHRcdFx0XHRpZiAoIWwpIHJldHVybiBob3RTdGF0dXM7XG4gXHRcdFx0XHRob3RTdGF0dXNIYW5kbGVycy5wdXNoKGwpO1xuIFx0XHRcdH0sXG4gXHRcdFx0YWRkU3RhdHVzSGFuZGxlcjogZnVuY3Rpb24obCkge1xuIFx0XHRcdFx0aG90U3RhdHVzSGFuZGxlcnMucHVzaChsKTtcbiBcdFx0XHR9LFxuIFx0XHRcdHJlbW92ZVN0YXR1c0hhbmRsZXI6IGZ1bmN0aW9uKGwpIHtcbiBcdFx0XHRcdHZhciBpZHggPSBob3RTdGF0dXNIYW5kbGVycy5pbmRleE9mKGwpO1xuIFx0XHRcdFx0aWYgKGlkeCA+PSAwKSBob3RTdGF0dXNIYW5kbGVycy5zcGxpY2UoaWR4LCAxKTtcbiBcdFx0XHR9LFxuXG4gXHRcdFx0Ly9pbmhlcml0IGZyb20gcHJldmlvdXMgZGlzcG9zZSBjYWxsXG4gXHRcdFx0ZGF0YTogaG90Q3VycmVudE1vZHVsZURhdGFbbW9kdWxlSWRdXG4gXHRcdH07XG4gXHRcdGhvdEN1cnJlbnRDaGlsZE1vZHVsZSA9IHVuZGVmaW5lZDtcbiBcdFx0cmV0dXJuIGhvdDtcbiBcdH1cblxuIFx0dmFyIGhvdFN0YXR1c0hhbmRsZXJzID0gW107XG4gXHR2YXIgaG90U3RhdHVzID0gXCJpZGxlXCI7XG5cbiBcdGZ1bmN0aW9uIGhvdFNldFN0YXR1cyhuZXdTdGF0dXMpIHtcbiBcdFx0aG90U3RhdHVzID0gbmV3U3RhdHVzO1xuIFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IGhvdFN0YXR1c0hhbmRsZXJzLmxlbmd0aDsgaSsrKVxuIFx0XHRcdGhvdFN0YXR1c0hhbmRsZXJzW2ldLmNhbGwobnVsbCwgbmV3U3RhdHVzKTtcbiBcdH1cblxuIFx0Ly8gd2hpbGUgZG93bmxvYWRpbmdcbiBcdHZhciBob3RXYWl0aW5nRmlsZXMgPSAwO1xuIFx0dmFyIGhvdENodW5rc0xvYWRpbmcgPSAwO1xuIFx0dmFyIGhvdFdhaXRpbmdGaWxlc01hcCA9IHt9O1xuIFx0dmFyIGhvdFJlcXVlc3RlZEZpbGVzTWFwID0ge307XG4gXHR2YXIgaG90QXZhaWxhYmxlRmlsZXNNYXAgPSB7fTtcbiBcdHZhciBob3REZWZlcnJlZDtcblxuIFx0Ly8gVGhlIHVwZGF0ZSBpbmZvXG4gXHR2YXIgaG90VXBkYXRlLCBob3RVcGRhdGVOZXdIYXNoO1xuXG4gXHRmdW5jdGlvbiB0b01vZHVsZUlkKGlkKSB7XG4gXHRcdHZhciBpc051bWJlciA9ICtpZCArIFwiXCIgPT09IGlkO1xuIFx0XHRyZXR1cm4gaXNOdW1iZXIgPyAraWQgOiBpZDtcbiBcdH1cblxuIFx0ZnVuY3Rpb24gaG90Q2hlY2soYXBwbHkpIHtcbiBcdFx0aWYgKGhvdFN0YXR1cyAhPT0gXCJpZGxlXCIpIHtcbiBcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJjaGVjaygpIGlzIG9ubHkgYWxsb3dlZCBpbiBpZGxlIHN0YXR1c1wiKTtcbiBcdFx0fVxuIFx0XHRob3RBcHBseU9uVXBkYXRlID0gYXBwbHk7XG4gXHRcdGhvdFNldFN0YXR1cyhcImNoZWNrXCIpO1xuIFx0XHRyZXR1cm4gaG90RG93bmxvYWRNYW5pZmVzdChob3RSZXF1ZXN0VGltZW91dCkudGhlbihmdW5jdGlvbih1cGRhdGUpIHtcbiBcdFx0XHRpZiAoIXVwZGF0ZSkge1xuIFx0XHRcdFx0aG90U2V0U3RhdHVzKFwiaWRsZVwiKTtcbiBcdFx0XHRcdHJldHVybiBudWxsO1xuIFx0XHRcdH1cbiBcdFx0XHRob3RSZXF1ZXN0ZWRGaWxlc01hcCA9IHt9O1xuIFx0XHRcdGhvdFdhaXRpbmdGaWxlc01hcCA9IHt9O1xuIFx0XHRcdGhvdEF2YWlsYWJsZUZpbGVzTWFwID0gdXBkYXRlLmM7XG4gXHRcdFx0aG90VXBkYXRlTmV3SGFzaCA9IHVwZGF0ZS5oO1xuXG4gXHRcdFx0aG90U2V0U3RhdHVzKFwicHJlcGFyZVwiKTtcbiBcdFx0XHR2YXIgcHJvbWlzZSA9IG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuIFx0XHRcdFx0aG90RGVmZXJyZWQgPSB7XG4gXHRcdFx0XHRcdHJlc29sdmU6IHJlc29sdmUsXG4gXHRcdFx0XHRcdHJlamVjdDogcmVqZWN0XG4gXHRcdFx0XHR9O1xuIFx0XHRcdH0pO1xuIFx0XHRcdGhvdFVwZGF0ZSA9IHt9O1xuIFx0XHRcdHZhciBjaHVua0lkID0gXCJmdW5jVGFza0V2ZW50c1wiO1xuIFx0XHRcdC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1sb25lLWJsb2Nrc1xuIFx0XHRcdHtcbiBcdFx0XHRcdC8qZ2xvYmFscyBjaHVua0lkICovXG4gXHRcdFx0XHRob3RFbnN1cmVVcGRhdGVDaHVuayhjaHVua0lkKTtcbiBcdFx0XHR9XG4gXHRcdFx0aWYgKFxuIFx0XHRcdFx0aG90U3RhdHVzID09PSBcInByZXBhcmVcIiAmJlxuIFx0XHRcdFx0aG90Q2h1bmtzTG9hZGluZyA9PT0gMCAmJlxuIFx0XHRcdFx0aG90V2FpdGluZ0ZpbGVzID09PSAwXG4gXHRcdFx0KSB7XG4gXHRcdFx0XHRob3RVcGRhdGVEb3dubG9hZGVkKCk7XG4gXHRcdFx0fVxuIFx0XHRcdHJldHVybiBwcm9taXNlO1xuIFx0XHR9KTtcbiBcdH1cblxuIFx0Ly8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXVudXNlZC12YXJzXG4gXHRmdW5jdGlvbiBob3RBZGRVcGRhdGVDaHVuayhjaHVua0lkLCBtb3JlTW9kdWxlcykge1xuIFx0XHRpZiAoIWhvdEF2YWlsYWJsZUZpbGVzTWFwW2NodW5rSWRdIHx8ICFob3RSZXF1ZXN0ZWRGaWxlc01hcFtjaHVua0lkXSlcbiBcdFx0XHRyZXR1cm47XG4gXHRcdGhvdFJlcXVlc3RlZEZpbGVzTWFwW2NodW5rSWRdID0gZmFsc2U7XG4gXHRcdGZvciAodmFyIG1vZHVsZUlkIGluIG1vcmVNb2R1bGVzKSB7XG4gXHRcdFx0aWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChtb3JlTW9kdWxlcywgbW9kdWxlSWQpKSB7XG4gXHRcdFx0XHRob3RVcGRhdGVbbW9kdWxlSWRdID0gbW9yZU1vZHVsZXNbbW9kdWxlSWRdO1xuIFx0XHRcdH1cbiBcdFx0fVxuIFx0XHRpZiAoLS1ob3RXYWl0aW5nRmlsZXMgPT09IDAgJiYgaG90Q2h1bmtzTG9hZGluZyA9PT0gMCkge1xuIFx0XHRcdGhvdFVwZGF0ZURvd25sb2FkZWQoKTtcbiBcdFx0fVxuIFx0fVxuXG4gXHRmdW5jdGlvbiBob3RFbnN1cmVVcGRhdGVDaHVuayhjaHVua0lkKSB7XG4gXHRcdGlmICghaG90QXZhaWxhYmxlRmlsZXNNYXBbY2h1bmtJZF0pIHtcbiBcdFx0XHRob3RXYWl0aW5nRmlsZXNNYXBbY2h1bmtJZF0gPSB0cnVlO1xuIFx0XHR9IGVsc2Uge1xuIFx0XHRcdGhvdFJlcXVlc3RlZEZpbGVzTWFwW2NodW5rSWRdID0gdHJ1ZTtcbiBcdFx0XHRob3RXYWl0aW5nRmlsZXMrKztcbiBcdFx0XHRob3REb3dubG9hZFVwZGF0ZUNodW5rKGNodW5rSWQpO1xuIFx0XHR9XG4gXHR9XG5cbiBcdGZ1bmN0aW9uIGhvdFVwZGF0ZURvd25sb2FkZWQoKSB7XG4gXHRcdGhvdFNldFN0YXR1cyhcInJlYWR5XCIpO1xuIFx0XHR2YXIgZGVmZXJyZWQgPSBob3REZWZlcnJlZDtcbiBcdFx0aG90RGVmZXJyZWQgPSBudWxsO1xuIFx0XHRpZiAoIWRlZmVycmVkKSByZXR1cm47XG4gXHRcdGlmIChob3RBcHBseU9uVXBkYXRlKSB7XG4gXHRcdFx0Ly8gV3JhcCBkZWZlcnJlZCBvYmplY3QgaW4gUHJvbWlzZSB0byBtYXJrIGl0IGFzIGEgd2VsbC1oYW5kbGVkIFByb21pc2UgdG9cbiBcdFx0XHQvLyBhdm9pZCB0cmlnZ2VyaW5nIHVuY2F1Z2h0IGV4Y2VwdGlvbiB3YXJuaW5nIGluIENocm9tZS5cbiBcdFx0XHQvLyBTZWUgaHR0cHM6Ly9idWdzLmNocm9taXVtLm9yZy9wL2Nocm9taXVtL2lzc3Vlcy9kZXRhaWw/aWQ9NDY1NjY2XG4gXHRcdFx0UHJvbWlzZS5yZXNvbHZlKClcbiBcdFx0XHRcdC50aGVuKGZ1bmN0aW9uKCkge1xuIFx0XHRcdFx0XHRyZXR1cm4gaG90QXBwbHkoaG90QXBwbHlPblVwZGF0ZSk7XG4gXHRcdFx0XHR9KVxuIFx0XHRcdFx0LnRoZW4oXG4gXHRcdFx0XHRcdGZ1bmN0aW9uKHJlc3VsdCkge1xuIFx0XHRcdFx0XHRcdGRlZmVycmVkLnJlc29sdmUocmVzdWx0KTtcbiBcdFx0XHRcdFx0fSxcbiBcdFx0XHRcdFx0ZnVuY3Rpb24oZXJyKSB7XG4gXHRcdFx0XHRcdFx0ZGVmZXJyZWQucmVqZWN0KGVycik7XG4gXHRcdFx0XHRcdH1cbiBcdFx0XHRcdCk7XG4gXHRcdH0gZWxzZSB7XG4gXHRcdFx0dmFyIG91dGRhdGVkTW9kdWxlcyA9IFtdO1xuIFx0XHRcdGZvciAodmFyIGlkIGluIGhvdFVwZGF0ZSkge1xuIFx0XHRcdFx0aWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChob3RVcGRhdGUsIGlkKSkge1xuIFx0XHRcdFx0XHRvdXRkYXRlZE1vZHVsZXMucHVzaCh0b01vZHVsZUlkKGlkKSk7XG4gXHRcdFx0XHR9XG4gXHRcdFx0fVxuIFx0XHRcdGRlZmVycmVkLnJlc29sdmUob3V0ZGF0ZWRNb2R1bGVzKTtcbiBcdFx0fVxuIFx0fVxuXG4gXHRmdW5jdGlvbiBob3RBcHBseShvcHRpb25zKSB7XG4gXHRcdGlmIChob3RTdGF0dXMgIT09IFwicmVhZHlcIilcbiBcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJhcHBseSgpIGlzIG9ubHkgYWxsb3dlZCBpbiByZWFkeSBzdGF0dXNcIik7XG4gXHRcdG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXG4gXHRcdHZhciBjYjtcbiBcdFx0dmFyIGk7XG4gXHRcdHZhciBqO1xuIFx0XHR2YXIgbW9kdWxlO1xuIFx0XHR2YXIgbW9kdWxlSWQ7XG5cbiBcdFx0ZnVuY3Rpb24gZ2V0QWZmZWN0ZWRTdHVmZih1cGRhdGVNb2R1bGVJZCkge1xuIFx0XHRcdHZhciBvdXRkYXRlZE1vZHVsZXMgPSBbdXBkYXRlTW9kdWxlSWRdO1xuIFx0XHRcdHZhciBvdXRkYXRlZERlcGVuZGVuY2llcyA9IHt9O1xuXG4gXHRcdFx0dmFyIHF1ZXVlID0gb3V0ZGF0ZWRNb2R1bGVzLnNsaWNlKCkubWFwKGZ1bmN0aW9uKGlkKSB7XG4gXHRcdFx0XHRyZXR1cm4ge1xuIFx0XHRcdFx0XHRjaGFpbjogW2lkXSxcbiBcdFx0XHRcdFx0aWQ6IGlkXG4gXHRcdFx0XHR9O1xuIFx0XHRcdH0pO1xuIFx0XHRcdHdoaWxlIChxdWV1ZS5sZW5ndGggPiAwKSB7XG4gXHRcdFx0XHR2YXIgcXVldWVJdGVtID0gcXVldWUucG9wKCk7XG4gXHRcdFx0XHR2YXIgbW9kdWxlSWQgPSBxdWV1ZUl0ZW0uaWQ7XG4gXHRcdFx0XHR2YXIgY2hhaW4gPSBxdWV1ZUl0ZW0uY2hhaW47XG4gXHRcdFx0XHRtb2R1bGUgPSBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXTtcbiBcdFx0XHRcdGlmICghbW9kdWxlIHx8IG1vZHVsZS5ob3QuX3NlbGZBY2NlcHRlZCkgY29udGludWU7XG4gXHRcdFx0XHRpZiAobW9kdWxlLmhvdC5fc2VsZkRlY2xpbmVkKSB7XG4gXHRcdFx0XHRcdHJldHVybiB7XG4gXHRcdFx0XHRcdFx0dHlwZTogXCJzZWxmLWRlY2xpbmVkXCIsXG4gXHRcdFx0XHRcdFx0Y2hhaW46IGNoYWluLFxuIFx0XHRcdFx0XHRcdG1vZHVsZUlkOiBtb2R1bGVJZFxuIFx0XHRcdFx0XHR9O1xuIFx0XHRcdFx0fVxuIFx0XHRcdFx0aWYgKG1vZHVsZS5ob3QuX21haW4pIHtcbiBcdFx0XHRcdFx0cmV0dXJuIHtcbiBcdFx0XHRcdFx0XHR0eXBlOiBcInVuYWNjZXB0ZWRcIixcbiBcdFx0XHRcdFx0XHRjaGFpbjogY2hhaW4sXG4gXHRcdFx0XHRcdFx0bW9kdWxlSWQ6IG1vZHVsZUlkXG4gXHRcdFx0XHRcdH07XG4gXHRcdFx0XHR9XG4gXHRcdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IG1vZHVsZS5wYXJlbnRzLmxlbmd0aDsgaSsrKSB7XG4gXHRcdFx0XHRcdHZhciBwYXJlbnRJZCA9IG1vZHVsZS5wYXJlbnRzW2ldO1xuIFx0XHRcdFx0XHR2YXIgcGFyZW50ID0gaW5zdGFsbGVkTW9kdWxlc1twYXJlbnRJZF07XG4gXHRcdFx0XHRcdGlmICghcGFyZW50KSBjb250aW51ZTtcbiBcdFx0XHRcdFx0aWYgKHBhcmVudC5ob3QuX2RlY2xpbmVkRGVwZW5kZW5jaWVzW21vZHVsZUlkXSkge1xuIFx0XHRcdFx0XHRcdHJldHVybiB7XG4gXHRcdFx0XHRcdFx0XHR0eXBlOiBcImRlY2xpbmVkXCIsXG4gXHRcdFx0XHRcdFx0XHRjaGFpbjogY2hhaW4uY29uY2F0KFtwYXJlbnRJZF0pLFxuIFx0XHRcdFx0XHRcdFx0bW9kdWxlSWQ6IG1vZHVsZUlkLFxuIFx0XHRcdFx0XHRcdFx0cGFyZW50SWQ6IHBhcmVudElkXG4gXHRcdFx0XHRcdFx0fTtcbiBcdFx0XHRcdFx0fVxuIFx0XHRcdFx0XHRpZiAob3V0ZGF0ZWRNb2R1bGVzLmluZGV4T2YocGFyZW50SWQpICE9PSAtMSkgY29udGludWU7XG4gXHRcdFx0XHRcdGlmIChwYXJlbnQuaG90Ll9hY2NlcHRlZERlcGVuZGVuY2llc1ttb2R1bGVJZF0pIHtcbiBcdFx0XHRcdFx0XHRpZiAoIW91dGRhdGVkRGVwZW5kZW5jaWVzW3BhcmVudElkXSlcbiBcdFx0XHRcdFx0XHRcdG91dGRhdGVkRGVwZW5kZW5jaWVzW3BhcmVudElkXSA9IFtdO1xuIFx0XHRcdFx0XHRcdGFkZEFsbFRvU2V0KG91dGRhdGVkRGVwZW5kZW5jaWVzW3BhcmVudElkXSwgW21vZHVsZUlkXSk7XG4gXHRcdFx0XHRcdFx0Y29udGludWU7XG4gXHRcdFx0XHRcdH1cbiBcdFx0XHRcdFx0ZGVsZXRlIG91dGRhdGVkRGVwZW5kZW5jaWVzW3BhcmVudElkXTtcbiBcdFx0XHRcdFx0b3V0ZGF0ZWRNb2R1bGVzLnB1c2gocGFyZW50SWQpO1xuIFx0XHRcdFx0XHRxdWV1ZS5wdXNoKHtcbiBcdFx0XHRcdFx0XHRjaGFpbjogY2hhaW4uY29uY2F0KFtwYXJlbnRJZF0pLFxuIFx0XHRcdFx0XHRcdGlkOiBwYXJlbnRJZFxuIFx0XHRcdFx0XHR9KTtcbiBcdFx0XHRcdH1cbiBcdFx0XHR9XG5cbiBcdFx0XHRyZXR1cm4ge1xuIFx0XHRcdFx0dHlwZTogXCJhY2NlcHRlZFwiLFxuIFx0XHRcdFx0bW9kdWxlSWQ6IHVwZGF0ZU1vZHVsZUlkLFxuIFx0XHRcdFx0b3V0ZGF0ZWRNb2R1bGVzOiBvdXRkYXRlZE1vZHVsZXMsXG4gXHRcdFx0XHRvdXRkYXRlZERlcGVuZGVuY2llczogb3V0ZGF0ZWREZXBlbmRlbmNpZXNcbiBcdFx0XHR9O1xuIFx0XHR9XG5cbiBcdFx0ZnVuY3Rpb24gYWRkQWxsVG9TZXQoYSwgYikge1xuIFx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgYi5sZW5ndGg7IGkrKykge1xuIFx0XHRcdFx0dmFyIGl0ZW0gPSBiW2ldO1xuIFx0XHRcdFx0aWYgKGEuaW5kZXhPZihpdGVtKSA9PT0gLTEpIGEucHVzaChpdGVtKTtcbiBcdFx0XHR9XG4gXHRcdH1cblxuIFx0XHQvLyBhdCBiZWdpbiBhbGwgdXBkYXRlcyBtb2R1bGVzIGFyZSBvdXRkYXRlZFxuIFx0XHQvLyB0aGUgXCJvdXRkYXRlZFwiIHN0YXR1cyBjYW4gcHJvcGFnYXRlIHRvIHBhcmVudHMgaWYgdGhleSBkb24ndCBhY2NlcHQgdGhlIGNoaWxkcmVuXG4gXHRcdHZhciBvdXRkYXRlZERlcGVuZGVuY2llcyA9IHt9O1xuIFx0XHR2YXIgb3V0ZGF0ZWRNb2R1bGVzID0gW107XG4gXHRcdHZhciBhcHBsaWVkVXBkYXRlID0ge307XG5cbiBcdFx0dmFyIHdhcm5VbmV4cGVjdGVkUmVxdWlyZSA9IGZ1bmN0aW9uIHdhcm5VbmV4cGVjdGVkUmVxdWlyZSgpIHtcbiBcdFx0XHRjb25zb2xlLndhcm4oXG4gXHRcdFx0XHRcIltITVJdIHVuZXhwZWN0ZWQgcmVxdWlyZShcIiArIHJlc3VsdC5tb2R1bGVJZCArIFwiKSB0byBkaXNwb3NlZCBtb2R1bGVcIlxuIFx0XHRcdCk7XG4gXHRcdH07XG5cbiBcdFx0Zm9yICh2YXIgaWQgaW4gaG90VXBkYXRlKSB7XG4gXHRcdFx0aWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChob3RVcGRhdGUsIGlkKSkge1xuIFx0XHRcdFx0bW9kdWxlSWQgPSB0b01vZHVsZUlkKGlkKTtcbiBcdFx0XHRcdC8qKiBAdHlwZSB7VE9ET30gKi9cbiBcdFx0XHRcdHZhciByZXN1bHQ7XG4gXHRcdFx0XHRpZiAoaG90VXBkYXRlW2lkXSkge1xuIFx0XHRcdFx0XHRyZXN1bHQgPSBnZXRBZmZlY3RlZFN0dWZmKG1vZHVsZUlkKTtcbiBcdFx0XHRcdH0gZWxzZSB7XG4gXHRcdFx0XHRcdHJlc3VsdCA9IHtcbiBcdFx0XHRcdFx0XHR0eXBlOiBcImRpc3Bvc2VkXCIsXG4gXHRcdFx0XHRcdFx0bW9kdWxlSWQ6IGlkXG4gXHRcdFx0XHRcdH07XG4gXHRcdFx0XHR9XG4gXHRcdFx0XHQvKiogQHR5cGUge0Vycm9yfGZhbHNlfSAqL1xuIFx0XHRcdFx0dmFyIGFib3J0RXJyb3IgPSBmYWxzZTtcbiBcdFx0XHRcdHZhciBkb0FwcGx5ID0gZmFsc2U7XG4gXHRcdFx0XHR2YXIgZG9EaXNwb3NlID0gZmFsc2U7XG4gXHRcdFx0XHR2YXIgY2hhaW5JbmZvID0gXCJcIjtcbiBcdFx0XHRcdGlmIChyZXN1bHQuY2hhaW4pIHtcbiBcdFx0XHRcdFx0Y2hhaW5JbmZvID0gXCJcXG5VcGRhdGUgcHJvcGFnYXRpb246IFwiICsgcmVzdWx0LmNoYWluLmpvaW4oXCIgLT4gXCIpO1xuIFx0XHRcdFx0fVxuIFx0XHRcdFx0c3dpdGNoIChyZXN1bHQudHlwZSkge1xuIFx0XHRcdFx0XHRjYXNlIFwic2VsZi1kZWNsaW5lZFwiOlxuIFx0XHRcdFx0XHRcdGlmIChvcHRpb25zLm9uRGVjbGluZWQpIG9wdGlvbnMub25EZWNsaW5lZChyZXN1bHQpO1xuIFx0XHRcdFx0XHRcdGlmICghb3B0aW9ucy5pZ25vcmVEZWNsaW5lZClcbiBcdFx0XHRcdFx0XHRcdGFib3J0RXJyb3IgPSBuZXcgRXJyb3IoXG4gXHRcdFx0XHRcdFx0XHRcdFwiQWJvcnRlZCBiZWNhdXNlIG9mIHNlbGYgZGVjbGluZTogXCIgK1xuIFx0XHRcdFx0XHRcdFx0XHRcdHJlc3VsdC5tb2R1bGVJZCArXG4gXHRcdFx0XHRcdFx0XHRcdFx0Y2hhaW5JbmZvXG4gXHRcdFx0XHRcdFx0XHQpO1xuIFx0XHRcdFx0XHRcdGJyZWFrO1xuIFx0XHRcdFx0XHRjYXNlIFwiZGVjbGluZWRcIjpcbiBcdFx0XHRcdFx0XHRpZiAob3B0aW9ucy5vbkRlY2xpbmVkKSBvcHRpb25zLm9uRGVjbGluZWQocmVzdWx0KTtcbiBcdFx0XHRcdFx0XHRpZiAoIW9wdGlvbnMuaWdub3JlRGVjbGluZWQpXG4gXHRcdFx0XHRcdFx0XHRhYm9ydEVycm9yID0gbmV3IEVycm9yKFxuIFx0XHRcdFx0XHRcdFx0XHRcIkFib3J0ZWQgYmVjYXVzZSBvZiBkZWNsaW5lZCBkZXBlbmRlbmN5OiBcIiArXG4gXHRcdFx0XHRcdFx0XHRcdFx0cmVzdWx0Lm1vZHVsZUlkICtcbiBcdFx0XHRcdFx0XHRcdFx0XHRcIiBpbiBcIiArXG4gXHRcdFx0XHRcdFx0XHRcdFx0cmVzdWx0LnBhcmVudElkICtcbiBcdFx0XHRcdFx0XHRcdFx0XHRjaGFpbkluZm9cbiBcdFx0XHRcdFx0XHRcdCk7XG4gXHRcdFx0XHRcdFx0YnJlYWs7XG4gXHRcdFx0XHRcdGNhc2UgXCJ1bmFjY2VwdGVkXCI6XG4gXHRcdFx0XHRcdFx0aWYgKG9wdGlvbnMub25VbmFjY2VwdGVkKSBvcHRpb25zLm9uVW5hY2NlcHRlZChyZXN1bHQpO1xuIFx0XHRcdFx0XHRcdGlmICghb3B0aW9ucy5pZ25vcmVVbmFjY2VwdGVkKVxuIFx0XHRcdFx0XHRcdFx0YWJvcnRFcnJvciA9IG5ldyBFcnJvcihcbiBcdFx0XHRcdFx0XHRcdFx0XCJBYm9ydGVkIGJlY2F1c2UgXCIgKyBtb2R1bGVJZCArIFwiIGlzIG5vdCBhY2NlcHRlZFwiICsgY2hhaW5JbmZvXG4gXHRcdFx0XHRcdFx0XHQpO1xuIFx0XHRcdFx0XHRcdGJyZWFrO1xuIFx0XHRcdFx0XHRjYXNlIFwiYWNjZXB0ZWRcIjpcbiBcdFx0XHRcdFx0XHRpZiAob3B0aW9ucy5vbkFjY2VwdGVkKSBvcHRpb25zLm9uQWNjZXB0ZWQocmVzdWx0KTtcbiBcdFx0XHRcdFx0XHRkb0FwcGx5ID0gdHJ1ZTtcbiBcdFx0XHRcdFx0XHRicmVhaztcbiBcdFx0XHRcdFx0Y2FzZSBcImRpc3Bvc2VkXCI6XG4gXHRcdFx0XHRcdFx0aWYgKG9wdGlvbnMub25EaXNwb3NlZCkgb3B0aW9ucy5vbkRpc3Bvc2VkKHJlc3VsdCk7XG4gXHRcdFx0XHRcdFx0ZG9EaXNwb3NlID0gdHJ1ZTtcbiBcdFx0XHRcdFx0XHRicmVhaztcbiBcdFx0XHRcdFx0ZGVmYXVsdDpcbiBcdFx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJVbmV4Y2VwdGlvbiB0eXBlIFwiICsgcmVzdWx0LnR5cGUpO1xuIFx0XHRcdFx0fVxuIFx0XHRcdFx0aWYgKGFib3J0RXJyb3IpIHtcbiBcdFx0XHRcdFx0aG90U2V0U3RhdHVzKFwiYWJvcnRcIik7XG4gXHRcdFx0XHRcdHJldHVybiBQcm9taXNlLnJlamVjdChhYm9ydEVycm9yKTtcbiBcdFx0XHRcdH1cbiBcdFx0XHRcdGlmIChkb0FwcGx5KSB7XG4gXHRcdFx0XHRcdGFwcGxpZWRVcGRhdGVbbW9kdWxlSWRdID0gaG90VXBkYXRlW21vZHVsZUlkXTtcbiBcdFx0XHRcdFx0YWRkQWxsVG9TZXQob3V0ZGF0ZWRNb2R1bGVzLCByZXN1bHQub3V0ZGF0ZWRNb2R1bGVzKTtcbiBcdFx0XHRcdFx0Zm9yIChtb2R1bGVJZCBpbiByZXN1bHQub3V0ZGF0ZWREZXBlbmRlbmNpZXMpIHtcbiBcdFx0XHRcdFx0XHRpZiAoXG4gXHRcdFx0XHRcdFx0XHRPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoXG4gXHRcdFx0XHRcdFx0XHRcdHJlc3VsdC5vdXRkYXRlZERlcGVuZGVuY2llcyxcbiBcdFx0XHRcdFx0XHRcdFx0bW9kdWxlSWRcbiBcdFx0XHRcdFx0XHRcdClcbiBcdFx0XHRcdFx0XHQpIHtcbiBcdFx0XHRcdFx0XHRcdGlmICghb3V0ZGF0ZWREZXBlbmRlbmNpZXNbbW9kdWxlSWRdKVxuIFx0XHRcdFx0XHRcdFx0XHRvdXRkYXRlZERlcGVuZGVuY2llc1ttb2R1bGVJZF0gPSBbXTtcbiBcdFx0XHRcdFx0XHRcdGFkZEFsbFRvU2V0KFxuIFx0XHRcdFx0XHRcdFx0XHRvdXRkYXRlZERlcGVuZGVuY2llc1ttb2R1bGVJZF0sXG4gXHRcdFx0XHRcdFx0XHRcdHJlc3VsdC5vdXRkYXRlZERlcGVuZGVuY2llc1ttb2R1bGVJZF1cbiBcdFx0XHRcdFx0XHRcdCk7XG4gXHRcdFx0XHRcdFx0fVxuIFx0XHRcdFx0XHR9XG4gXHRcdFx0XHR9XG4gXHRcdFx0XHRpZiAoZG9EaXNwb3NlKSB7XG4gXHRcdFx0XHRcdGFkZEFsbFRvU2V0KG91dGRhdGVkTW9kdWxlcywgW3Jlc3VsdC5tb2R1bGVJZF0pO1xuIFx0XHRcdFx0XHRhcHBsaWVkVXBkYXRlW21vZHVsZUlkXSA9IHdhcm5VbmV4cGVjdGVkUmVxdWlyZTtcbiBcdFx0XHRcdH1cbiBcdFx0XHR9XG4gXHRcdH1cblxuIFx0XHQvLyBTdG9yZSBzZWxmIGFjY2VwdGVkIG91dGRhdGVkIG1vZHVsZXMgdG8gcmVxdWlyZSB0aGVtIGxhdGVyIGJ5IHRoZSBtb2R1bGUgc3lzdGVtXG4gXHRcdHZhciBvdXRkYXRlZFNlbGZBY2NlcHRlZE1vZHVsZXMgPSBbXTtcbiBcdFx0Zm9yIChpID0gMDsgaSA8IG91dGRhdGVkTW9kdWxlcy5sZW5ndGg7IGkrKykge1xuIFx0XHRcdG1vZHVsZUlkID0gb3V0ZGF0ZWRNb2R1bGVzW2ldO1xuIFx0XHRcdGlmIChcbiBcdFx0XHRcdGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdICYmXG4gXHRcdFx0XHRpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXS5ob3QuX3NlbGZBY2NlcHRlZFxuIFx0XHRcdClcbiBcdFx0XHRcdG91dGRhdGVkU2VsZkFjY2VwdGVkTW9kdWxlcy5wdXNoKHtcbiBcdFx0XHRcdFx0bW9kdWxlOiBtb2R1bGVJZCxcbiBcdFx0XHRcdFx0ZXJyb3JIYW5kbGVyOiBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXS5ob3QuX3NlbGZBY2NlcHRlZFxuIFx0XHRcdFx0fSk7XG4gXHRcdH1cblxuIFx0XHQvLyBOb3cgaW4gXCJkaXNwb3NlXCIgcGhhc2VcbiBcdFx0aG90U2V0U3RhdHVzKFwiZGlzcG9zZVwiKTtcbiBcdFx0T2JqZWN0LmtleXMoaG90QXZhaWxhYmxlRmlsZXNNYXApLmZvckVhY2goZnVuY3Rpb24oY2h1bmtJZCkge1xuIFx0XHRcdGlmIChob3RBdmFpbGFibGVGaWxlc01hcFtjaHVua0lkXSA9PT0gZmFsc2UpIHtcbiBcdFx0XHRcdGhvdERpc3Bvc2VDaHVuayhjaHVua0lkKTtcbiBcdFx0XHR9XG4gXHRcdH0pO1xuXG4gXHRcdHZhciBpZHg7XG4gXHRcdHZhciBxdWV1ZSA9IG91dGRhdGVkTW9kdWxlcy5zbGljZSgpO1xuIFx0XHR3aGlsZSAocXVldWUubGVuZ3RoID4gMCkge1xuIFx0XHRcdG1vZHVsZUlkID0gcXVldWUucG9wKCk7XG4gXHRcdFx0bW9kdWxlID0gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF07XG4gXHRcdFx0aWYgKCFtb2R1bGUpIGNvbnRpbnVlO1xuXG4gXHRcdFx0dmFyIGRhdGEgPSB7fTtcblxuIFx0XHRcdC8vIENhbGwgZGlzcG9zZSBoYW5kbGVyc1xuIFx0XHRcdHZhciBkaXNwb3NlSGFuZGxlcnMgPSBtb2R1bGUuaG90Ll9kaXNwb3NlSGFuZGxlcnM7XG4gXHRcdFx0Zm9yIChqID0gMDsgaiA8IGRpc3Bvc2VIYW5kbGVycy5sZW5ndGg7IGorKykge1xuIFx0XHRcdFx0Y2IgPSBkaXNwb3NlSGFuZGxlcnNbal07XG4gXHRcdFx0XHRjYihkYXRhKTtcbiBcdFx0XHR9XG4gXHRcdFx0aG90Q3VycmVudE1vZHVsZURhdGFbbW9kdWxlSWRdID0gZGF0YTtcblxuIFx0XHRcdC8vIGRpc2FibGUgbW9kdWxlICh0aGlzIGRpc2FibGVzIHJlcXVpcmVzIGZyb20gdGhpcyBtb2R1bGUpXG4gXHRcdFx0bW9kdWxlLmhvdC5hY3RpdmUgPSBmYWxzZTtcblxuIFx0XHRcdC8vIHJlbW92ZSBtb2R1bGUgZnJvbSBjYWNoZVxuIFx0XHRcdGRlbGV0ZSBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXTtcblxuIFx0XHRcdC8vIHdoZW4gZGlzcG9zaW5nIHRoZXJlIGlzIG5vIG5lZWQgdG8gY2FsbCBkaXNwb3NlIGhhbmRsZXJcbiBcdFx0XHRkZWxldGUgb3V0ZGF0ZWREZXBlbmRlbmNpZXNbbW9kdWxlSWRdO1xuXG4gXHRcdFx0Ly8gcmVtb3ZlIFwicGFyZW50c1wiIHJlZmVyZW5jZXMgZnJvbSBhbGwgY2hpbGRyZW5cbiBcdFx0XHRmb3IgKGogPSAwOyBqIDwgbW9kdWxlLmNoaWxkcmVuLmxlbmd0aDsgaisrKSB7XG4gXHRcdFx0XHR2YXIgY2hpbGQgPSBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZS5jaGlsZHJlbltqXV07XG4gXHRcdFx0XHRpZiAoIWNoaWxkKSBjb250aW51ZTtcbiBcdFx0XHRcdGlkeCA9IGNoaWxkLnBhcmVudHMuaW5kZXhPZihtb2R1bGVJZCk7XG4gXHRcdFx0XHRpZiAoaWR4ID49IDApIHtcbiBcdFx0XHRcdFx0Y2hpbGQucGFyZW50cy5zcGxpY2UoaWR4LCAxKTtcbiBcdFx0XHRcdH1cbiBcdFx0XHR9XG4gXHRcdH1cblxuIFx0XHQvLyByZW1vdmUgb3V0ZGF0ZWQgZGVwZW5kZW5jeSBmcm9tIG1vZHVsZSBjaGlsZHJlblxuIFx0XHR2YXIgZGVwZW5kZW5jeTtcbiBcdFx0dmFyIG1vZHVsZU91dGRhdGVkRGVwZW5kZW5jaWVzO1xuIFx0XHRmb3IgKG1vZHVsZUlkIGluIG91dGRhdGVkRGVwZW5kZW5jaWVzKSB7XG4gXHRcdFx0aWYgKFxuIFx0XHRcdFx0T2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG91dGRhdGVkRGVwZW5kZW5jaWVzLCBtb2R1bGVJZClcbiBcdFx0XHQpIHtcbiBcdFx0XHRcdG1vZHVsZSA9IGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdO1xuIFx0XHRcdFx0aWYgKG1vZHVsZSkge1xuIFx0XHRcdFx0XHRtb2R1bGVPdXRkYXRlZERlcGVuZGVuY2llcyA9IG91dGRhdGVkRGVwZW5kZW5jaWVzW21vZHVsZUlkXTtcbiBcdFx0XHRcdFx0Zm9yIChqID0gMDsgaiA8IG1vZHVsZU91dGRhdGVkRGVwZW5kZW5jaWVzLmxlbmd0aDsgaisrKSB7XG4gXHRcdFx0XHRcdFx0ZGVwZW5kZW5jeSA9IG1vZHVsZU91dGRhdGVkRGVwZW5kZW5jaWVzW2pdO1xuIFx0XHRcdFx0XHRcdGlkeCA9IG1vZHVsZS5jaGlsZHJlbi5pbmRleE9mKGRlcGVuZGVuY3kpO1xuIFx0XHRcdFx0XHRcdGlmIChpZHggPj0gMCkgbW9kdWxlLmNoaWxkcmVuLnNwbGljZShpZHgsIDEpO1xuIFx0XHRcdFx0XHR9XG4gXHRcdFx0XHR9XG4gXHRcdFx0fVxuIFx0XHR9XG5cbiBcdFx0Ly8gTm90IGluIFwiYXBwbHlcIiBwaGFzZVxuIFx0XHRob3RTZXRTdGF0dXMoXCJhcHBseVwiKTtcblxuIFx0XHRob3RDdXJyZW50SGFzaCA9IGhvdFVwZGF0ZU5ld0hhc2g7XG5cbiBcdFx0Ly8gaW5zZXJ0IG5ldyBjb2RlXG4gXHRcdGZvciAobW9kdWxlSWQgaW4gYXBwbGllZFVwZGF0ZSkge1xuIFx0XHRcdGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoYXBwbGllZFVwZGF0ZSwgbW9kdWxlSWQpKSB7XG4gXHRcdFx0XHRtb2R1bGVzW21vZHVsZUlkXSA9IGFwcGxpZWRVcGRhdGVbbW9kdWxlSWRdO1xuIFx0XHRcdH1cbiBcdFx0fVxuXG4gXHRcdC8vIGNhbGwgYWNjZXB0IGhhbmRsZXJzXG4gXHRcdHZhciBlcnJvciA9IG51bGw7XG4gXHRcdGZvciAobW9kdWxlSWQgaW4gb3V0ZGF0ZWREZXBlbmRlbmNpZXMpIHtcbiBcdFx0XHRpZiAoXG4gXHRcdFx0XHRPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob3V0ZGF0ZWREZXBlbmRlbmNpZXMsIG1vZHVsZUlkKVxuIFx0XHRcdCkge1xuIFx0XHRcdFx0bW9kdWxlID0gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF07XG4gXHRcdFx0XHRpZiAobW9kdWxlKSB7XG4gXHRcdFx0XHRcdG1vZHVsZU91dGRhdGVkRGVwZW5kZW5jaWVzID0gb3V0ZGF0ZWREZXBlbmRlbmNpZXNbbW9kdWxlSWRdO1xuIFx0XHRcdFx0XHR2YXIgY2FsbGJhY2tzID0gW107XG4gXHRcdFx0XHRcdGZvciAoaSA9IDA7IGkgPCBtb2R1bGVPdXRkYXRlZERlcGVuZGVuY2llcy5sZW5ndGg7IGkrKykge1xuIFx0XHRcdFx0XHRcdGRlcGVuZGVuY3kgPSBtb2R1bGVPdXRkYXRlZERlcGVuZGVuY2llc1tpXTtcbiBcdFx0XHRcdFx0XHRjYiA9IG1vZHVsZS5ob3QuX2FjY2VwdGVkRGVwZW5kZW5jaWVzW2RlcGVuZGVuY3ldO1xuIFx0XHRcdFx0XHRcdGlmIChjYikge1xuIFx0XHRcdFx0XHRcdFx0aWYgKGNhbGxiYWNrcy5pbmRleE9mKGNiKSAhPT0gLTEpIGNvbnRpbnVlO1xuIFx0XHRcdFx0XHRcdFx0Y2FsbGJhY2tzLnB1c2goY2IpO1xuIFx0XHRcdFx0XHRcdH1cbiBcdFx0XHRcdFx0fVxuIFx0XHRcdFx0XHRmb3IgKGkgPSAwOyBpIDwgY2FsbGJhY2tzLmxlbmd0aDsgaSsrKSB7XG4gXHRcdFx0XHRcdFx0Y2IgPSBjYWxsYmFja3NbaV07XG4gXHRcdFx0XHRcdFx0dHJ5IHtcbiBcdFx0XHRcdFx0XHRcdGNiKG1vZHVsZU91dGRhdGVkRGVwZW5kZW5jaWVzKTtcbiBcdFx0XHRcdFx0XHR9IGNhdGNoIChlcnIpIHtcbiBcdFx0XHRcdFx0XHRcdGlmIChvcHRpb25zLm9uRXJyb3JlZCkge1xuIFx0XHRcdFx0XHRcdFx0XHRvcHRpb25zLm9uRXJyb3JlZCh7XG4gXHRcdFx0XHRcdFx0XHRcdFx0dHlwZTogXCJhY2NlcHQtZXJyb3JlZFwiLFxuIFx0XHRcdFx0XHRcdFx0XHRcdG1vZHVsZUlkOiBtb2R1bGVJZCxcbiBcdFx0XHRcdFx0XHRcdFx0XHRkZXBlbmRlbmN5SWQ6IG1vZHVsZU91dGRhdGVkRGVwZW5kZW5jaWVzW2ldLFxuIFx0XHRcdFx0XHRcdFx0XHRcdGVycm9yOiBlcnJcbiBcdFx0XHRcdFx0XHRcdFx0fSk7XG4gXHRcdFx0XHRcdFx0XHR9XG4gXHRcdFx0XHRcdFx0XHRpZiAoIW9wdGlvbnMuaWdub3JlRXJyb3JlZCkge1xuIFx0XHRcdFx0XHRcdFx0XHRpZiAoIWVycm9yKSBlcnJvciA9IGVycjtcbiBcdFx0XHRcdFx0XHRcdH1cbiBcdFx0XHRcdFx0XHR9XG4gXHRcdFx0XHRcdH1cbiBcdFx0XHRcdH1cbiBcdFx0XHR9XG4gXHRcdH1cblxuIFx0XHQvLyBMb2FkIHNlbGYgYWNjZXB0ZWQgbW9kdWxlc1xuIFx0XHRmb3IgKGkgPSAwOyBpIDwgb3V0ZGF0ZWRTZWxmQWNjZXB0ZWRNb2R1bGVzLmxlbmd0aDsgaSsrKSB7XG4gXHRcdFx0dmFyIGl0ZW0gPSBvdXRkYXRlZFNlbGZBY2NlcHRlZE1vZHVsZXNbaV07XG4gXHRcdFx0bW9kdWxlSWQgPSBpdGVtLm1vZHVsZTtcbiBcdFx0XHRob3RDdXJyZW50UGFyZW50cyA9IFttb2R1bGVJZF07XG4gXHRcdFx0dHJ5IHtcbiBcdFx0XHRcdF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpO1xuIFx0XHRcdH0gY2F0Y2ggKGVycikge1xuIFx0XHRcdFx0aWYgKHR5cGVvZiBpdGVtLmVycm9ySGFuZGxlciA9PT0gXCJmdW5jdGlvblwiKSB7XG4gXHRcdFx0XHRcdHRyeSB7XG4gXHRcdFx0XHRcdFx0aXRlbS5lcnJvckhhbmRsZXIoZXJyKTtcbiBcdFx0XHRcdFx0fSBjYXRjaCAoZXJyMikge1xuIFx0XHRcdFx0XHRcdGlmIChvcHRpb25zLm9uRXJyb3JlZCkge1xuIFx0XHRcdFx0XHRcdFx0b3B0aW9ucy5vbkVycm9yZWQoe1xuIFx0XHRcdFx0XHRcdFx0XHR0eXBlOiBcInNlbGYtYWNjZXB0LWVycm9yLWhhbmRsZXItZXJyb3JlZFwiLFxuIFx0XHRcdFx0XHRcdFx0XHRtb2R1bGVJZDogbW9kdWxlSWQsXG4gXHRcdFx0XHRcdFx0XHRcdGVycm9yOiBlcnIyLFxuIFx0XHRcdFx0XHRcdFx0XHRvcmlnaW5hbEVycm9yOiBlcnJcbiBcdFx0XHRcdFx0XHRcdH0pO1xuIFx0XHRcdFx0XHRcdH1cbiBcdFx0XHRcdFx0XHRpZiAoIW9wdGlvbnMuaWdub3JlRXJyb3JlZCkge1xuIFx0XHRcdFx0XHRcdFx0aWYgKCFlcnJvcikgZXJyb3IgPSBlcnIyO1xuIFx0XHRcdFx0XHRcdH1cbiBcdFx0XHRcdFx0XHRpZiAoIWVycm9yKSBlcnJvciA9IGVycjtcbiBcdFx0XHRcdFx0fVxuIFx0XHRcdFx0fSBlbHNlIHtcbiBcdFx0XHRcdFx0aWYgKG9wdGlvbnMub25FcnJvcmVkKSB7XG4gXHRcdFx0XHRcdFx0b3B0aW9ucy5vbkVycm9yZWQoe1xuIFx0XHRcdFx0XHRcdFx0dHlwZTogXCJzZWxmLWFjY2VwdC1lcnJvcmVkXCIsXG4gXHRcdFx0XHRcdFx0XHRtb2R1bGVJZDogbW9kdWxlSWQsXG4gXHRcdFx0XHRcdFx0XHRlcnJvcjogZXJyXG4gXHRcdFx0XHRcdFx0fSk7XG4gXHRcdFx0XHRcdH1cbiBcdFx0XHRcdFx0aWYgKCFvcHRpb25zLmlnbm9yZUVycm9yZWQpIHtcbiBcdFx0XHRcdFx0XHRpZiAoIWVycm9yKSBlcnJvciA9IGVycjtcbiBcdFx0XHRcdFx0fVxuIFx0XHRcdFx0fVxuIFx0XHRcdH1cbiBcdFx0fVxuXG4gXHRcdC8vIGhhbmRsZSBlcnJvcnMgaW4gYWNjZXB0IGhhbmRsZXJzIGFuZCBzZWxmIGFjY2VwdGVkIG1vZHVsZSBsb2FkXG4gXHRcdGlmIChlcnJvcikge1xuIFx0XHRcdGhvdFNldFN0YXR1cyhcImZhaWxcIik7XG4gXHRcdFx0cmV0dXJuIFByb21pc2UucmVqZWN0KGVycm9yKTtcbiBcdFx0fVxuXG4gXHRcdGhvdFNldFN0YXR1cyhcImlkbGVcIik7XG4gXHRcdHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlKSB7XG4gXHRcdFx0cmVzb2x2ZShvdXRkYXRlZE1vZHVsZXMpO1xuIFx0XHR9KTtcbiBcdH1cblxuIFx0Ly8gVGhlIG1vZHVsZSBjYWNoZVxuIFx0dmFyIGluc3RhbGxlZE1vZHVsZXMgPSB7fTtcblxuIFx0Ly8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbiBcdGZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblxuIFx0XHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcbiBcdFx0aWYoaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0pIHtcbiBcdFx0XHRyZXR1cm4gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0uZXhwb3J0cztcbiBcdFx0fVxuIFx0XHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuIFx0XHR2YXIgbW9kdWxlID0gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0gPSB7XG4gXHRcdFx0aTogbW9kdWxlSWQsXG4gXHRcdFx0bDogZmFsc2UsXG4gXHRcdFx0ZXhwb3J0czoge30sXG4gXHRcdFx0aG90OiBob3RDcmVhdGVNb2R1bGUobW9kdWxlSWQpLFxuIFx0XHRcdHBhcmVudHM6IChob3RDdXJyZW50UGFyZW50c1RlbXAgPSBob3RDdXJyZW50UGFyZW50cywgaG90Q3VycmVudFBhcmVudHMgPSBbXSwgaG90Q3VycmVudFBhcmVudHNUZW1wKSxcbiBcdFx0XHRjaGlsZHJlbjogW11cbiBcdFx0fTtcblxuIFx0XHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cbiBcdFx0bW9kdWxlc1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgaG90Q3JlYXRlUmVxdWlyZShtb2R1bGVJZCkpO1xuXG4gXHRcdC8vIEZsYWcgdGhlIG1vZHVsZSBhcyBsb2FkZWRcbiBcdFx0bW9kdWxlLmwgPSB0cnVlO1xuXG4gXHRcdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG4gXHRcdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbiBcdH1cblxuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZXMgb2JqZWN0IChfX3dlYnBhY2tfbW9kdWxlc19fKVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5tID0gbW9kdWxlcztcblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGUgY2FjaGVcbiBcdF9fd2VicGFja19yZXF1aXJlX18uYyA9IGluc3RhbGxlZE1vZHVsZXM7XG5cbiBcdC8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb24gZm9yIGhhcm1vbnkgZXhwb3J0c1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kID0gZnVuY3Rpb24oZXhwb3J0cywgbmFtZSwgZ2V0dGVyKSB7XG4gXHRcdGlmKCFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywgbmFtZSkpIHtcbiBcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgbmFtZSwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGdldHRlciB9KTtcbiBcdFx0fVxuIFx0fTtcblxuIFx0Ly8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5yID0gZnVuY3Rpb24oZXhwb3J0cykge1xuIFx0XHRpZih0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9TdHJpbmdUYWcpIHtcbiBcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcbiBcdFx0fVxuIFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xuIFx0fTtcblxuIFx0Ly8gY3JlYXRlIGEgZmFrZSBuYW1lc3BhY2Ugb2JqZWN0XG4gXHQvLyBtb2RlICYgMTogdmFsdWUgaXMgYSBtb2R1bGUgaWQsIHJlcXVpcmUgaXRcbiBcdC8vIG1vZGUgJiAyOiBtZXJnZSBhbGwgcHJvcGVydGllcyBvZiB2YWx1ZSBpbnRvIHRoZSBuc1xuIFx0Ly8gbW9kZSAmIDQ6IHJldHVybiB2YWx1ZSB3aGVuIGFscmVhZHkgbnMgb2JqZWN0XG4gXHQvLyBtb2RlICYgOHwxOiBiZWhhdmUgbGlrZSByZXF1aXJlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnQgPSBmdW5jdGlvbih2YWx1ZSwgbW9kZSkge1xuIFx0XHRpZihtb2RlICYgMSkgdmFsdWUgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKHZhbHVlKTtcbiBcdFx0aWYobW9kZSAmIDgpIHJldHVybiB2YWx1ZTtcbiBcdFx0aWYoKG1vZGUgJiA0KSAmJiB0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnICYmIHZhbHVlICYmIHZhbHVlLl9fZXNNb2R1bGUpIHJldHVybiB2YWx1ZTtcbiBcdFx0dmFyIG5zID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbiBcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5yKG5zKTtcbiBcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KG5zLCAnZGVmYXVsdCcsIHsgZW51bWVyYWJsZTogdHJ1ZSwgdmFsdWU6IHZhbHVlIH0pO1xuIFx0XHRpZihtb2RlICYgMiAmJiB0eXBlb2YgdmFsdWUgIT0gJ3N0cmluZycpIGZvcih2YXIga2V5IGluIHZhbHVlKSBfX3dlYnBhY2tfcmVxdWlyZV9fLmQobnMsIGtleSwgZnVuY3Rpb24oa2V5KSB7IHJldHVybiB2YWx1ZVtrZXldOyB9LmJpbmQobnVsbCwga2V5KSk7XG4gXHRcdHJldHVybiBucztcbiBcdH07XG5cbiBcdC8vIGdldERlZmF1bHRFeHBvcnQgZnVuY3Rpb24gZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBub24taGFybW9ueSBtb2R1bGVzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm4gPSBmdW5jdGlvbihtb2R1bGUpIHtcbiBcdFx0dmFyIGdldHRlciA9IG1vZHVsZSAmJiBtb2R1bGUuX19lc01vZHVsZSA/XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0RGVmYXVsdCgpIHsgcmV0dXJuIG1vZHVsZVsnZGVmYXVsdCddOyB9IDpcbiBcdFx0XHRmdW5jdGlvbiBnZXRNb2R1bGVFeHBvcnRzKCkgeyByZXR1cm4gbW9kdWxlOyB9O1xuIFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQoZ2V0dGVyLCAnYScsIGdldHRlcik7XG4gXHRcdHJldHVybiBnZXR0ZXI7XG4gXHR9O1xuXG4gXHQvLyBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGxcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubyA9IGZ1bmN0aW9uKG9iamVjdCwgcHJvcGVydHkpIHsgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmplY3QsIHByb3BlcnR5KTsgfTtcblxuIFx0Ly8gX193ZWJwYWNrX3B1YmxpY19wYXRoX19cbiBcdF9fd2VicGFja19yZXF1aXJlX18ucCA9IFwiXCI7XG5cbiBcdC8vIF9fd2VicGFja19oYXNoX19cbiBcdF9fd2VicGFja19yZXF1aXJlX18uaCA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gaG90Q3VycmVudEhhc2g7IH07XG5cblxuIFx0Ly8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4gXHRyZXR1cm4gaG90Q3JlYXRlUmVxdWlyZShcIi4vc3JjL2Z1bmNzL2Z1bmNUYXNrRXZlbnRzLmpzXCIpKF9fd2VicGFja19yZXF1aXJlX18ucyA9IFwiLi9zcmMvZnVuY3MvZnVuY1Rhc2tFdmVudHMuanNcIik7XG4iLCJjb25zdCBSRVFVSVJFRF9ISVNUT1JZX01BWF9CQVJTID0gMTAwOyAvLyDQnNCw0LrRgdC40LzQsNC70YzQvdC+0LUg0LrQvtC70LjRh9C10YHRgtCy0L4g0LHQsNGA0L7QsiDQsiDQutGN0YjQtSAoXCJDYW5kbGVzXCIgQXp1cmUgU3RvcmFnZSBUYWJsZSlcblxuZXhwb3J0IHsgUkVRVUlSRURfSElTVE9SWV9NQVhfQkFSUyB9O1xuIiwiY29uc3QgQ0FORExFU19ORVdDQU5ETEVfRVZFTlQgPSB7XG4gIGV2ZW50VHlwZTogXCJDUFouQ2FuZGxlcy5OZXdDYW5kbGVcIixcblxuICBkYXRhU2NoZW1hOiB7XG4gICAgY2FuZGxlSWQ6IHsgZGVzY3JpcHRpb246IFwiVW5pcSBDYW5kbGUgSWQuXCIsIHR5cGU6IFwic3RyaW5nXCIsIGVtcHR5OiBmYWxzZSB9LFxuICAgIGV4Y2hhbmdlOiB7IGRlc2NyaXB0aW9uOiBcIkV4Y2hhbmdlIGNvZGUuXCIsIHR5cGU6IFwic3RyaW5nXCIsIGVtcHR5OiBmYWxzZSB9LFxuICAgIGFzc2V0OiB7IGRlc2NyaXB0aW9uOiBcIkJhc2UgY3VycmVuY3kuXCIsIHR5cGU6IFwic3RyaW5nXCIsIGVtcHR5OiBmYWxzZSB9LFxuICAgIGN1cnJlbmN5OiB7IGRlc2NyaXB0aW9uOiBcIlF1b3RlIGN1cnJlbmN5LlwiLCB0eXBlOiBcInN0cmluZ1wiLCBlbXB0eTogZmFsc2UgfSxcbiAgICB0aW1lZnJhbWU6IHtcbiAgICAgIGRlc2NyaXB0aW9uOiBcIlRpbWVmcmFtZSBpbiBtaW51dGVzLlwiLFxuICAgICAgdHlwZTogXCJudW1iZXJcIlxuICAgIH0sXG4gICAgdGltZTogeyBkZXNjcmlwdGlvbjogXCJDYW5kbGUgdGltZSBpbiBzZWNvbmRzLlwiLCB0eXBlOiBcIm51bWJlclwiIH0sXG4gICAgb3BlbjogeyBkZXNjcmlwdGlvbjogXCJDYW5kbGUgT3BlbiBQcmljZS5cIiwgdHlwZTogXCJudW1iZXJcIiB9LFxuICAgIGNsb3NlOiB7IGRlc2NyaXB0aW9uOiBcIkNhbmRsZSBDbG9zZSBQcmljZS5cIiwgdHlwZTogXCJudW1iZXJcIiB9LFxuICAgIGhpZ2g6IHsgZGVzY3JpcHRpb246IFwiQ2FuZGxlIEhpZ2hlc3QgUHJpY2UuXCIsIHR5cGU6IFwibnVtYmVyXCIgfSxcbiAgICBsb3c6IHsgZGVzY3JpcHRpb246IFwiVHJhZGUgTG93ZXN0IFByaWNlLlwiLCB0eXBlOiBcIm51bWJlclwiIH0sXG4gICAgdm9sdW1lOiB7IGRlc2NyaXB0aW9uOiBcIkNhbmRsZSBWb2x1bWUuXCIsIHR5cGU6IFwibnVtYmVyXCIgfVxuICB9XG59O1xuY29uc3QgQ0FORExFU19IQU5ETEVEX0VWRU5UID0ge1xuICBldmVudFR5cGU6IFwiQ1BaLkNhbmRsZXMuSGFuZGxlZFwiLFxuXG4gIGRhdGFTY2hlbWE6IHtcbiAgICBjYW5kbGVJZDogeyBkZXNjcmlwdGlvbjogXCJVbmlxIENhbmRsZSBJZC5cIiwgdHlwZTogXCJzdHJpbmdcIiwgZW1wdHk6IGZhbHNlIH0sXG4gICAgc2VydmljZToge1xuICAgICAgZGVzY3JpcHRpb246IFwiU2V2aWNlIG5hbWUgaGFuZGVsaW5nIGV2ZW50XCIsXG4gICAgICB0eXBlOiBcInN0cmluZ1wiLFxuICAgICAgdmFsdWVzOiBbXCJhZHZpc2VyXCIsIFwidHJhZGVyXCJdXG4gICAgfSxcbiAgICBzdWNjZXNzOiB7XG4gICAgICBkZXNjcmlwdGlvbjogXCJTdWNjZXNzIGV4ZWN1dGlvbiBsaXN0XCIsXG4gICAgICB0eXBlOiBcImFycmF5XCIsXG4gICAgICBpdGVtczogXCJzdHJpbmdcIlxuICAgIH0sXG4gICAgZXJyb3I6IHtcbiAgICAgIGRlc2NyaXB0aW9uOiBcIkVycm9yIGV4ZWN1dGlvbiBsaXN0XCIsXG4gICAgICB0eXBlOiBcImFycmF5XCIsXG4gICAgICBpdGVtczoge1xuICAgICAgICB0eXBlOiBcIm9iamVjdFwiLFxuICAgICAgICBwcm9wczoge1xuICAgICAgICAgIHRhc2tJZDogeyB0eXBlOiBcInN0cmluZ1wiLCBlbXB0eTogZmFsc2UgfSxcbiAgICAgICAgICBlcnJvcjoge1xuICAgICAgICAgICAgdHlwZTogXCJvYmplY3RcIixcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBcIkVycm9yIG9iamVjdCBpZiBzb21ldGhpbmcgZ29lcyB3cm9uZy5cIixcbiAgICAgICAgICAgIHByb3BzOiB7XG4gICAgICAgICAgICAgIGNvZGU6IHtcbiAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogXCJFcnJvciBjb2RlLlwiLFxuICAgICAgICAgICAgICAgIHR5cGU6IFwic3RyaW5nXCIsXG4gICAgICAgICAgICAgICAgZW1wdHk6IGZhbHNlXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIG1lc3NhZ2U6IHtcbiAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogXCJFcnJvciBtZXNzYWdlLlwiLFxuICAgICAgICAgICAgICAgIHR5cGU6IFwic3RyaW5nXCIsXG4gICAgICAgICAgICAgICAgZW1wdHk6IGZhbHNlXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIGRldGFpbDoge1xuICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBcIkVycm9yIGRldGFpbC5cIixcbiAgICAgICAgICAgICAgICB0eXBlOiBcInN0cmluZ1wiLFxuICAgICAgICAgICAgICAgIG9wdGlvbmFsOiB0cnVlLFxuICAgICAgICAgICAgICAgIGVtcHR5OiBmYWxzZVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgb3B0aW9uYWw6IHRydWVcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH0sXG4gIHN1Y2Nlc3NQZW5kaW5nOiB7XG4gICAgZGVzY3JpcHRpb246IFwiU3VjY2VzcyBxdWV1ZWQgbGlzdFwiLFxuICAgIHR5cGU6IFwiYXJyYXlcIixcbiAgICBpdGVtczogXCJzdHJpbmdcIlxuICB9LFxuICBlcnJvclBlbmRpbmc6IHtcbiAgICBkZXNjcmlwdGlvbjogXCJFcnJvciBxdWV1ZWQgbGlzdFwiLFxuICAgIHR5cGU6IFwiYXJyYXlcIixcbiAgICBpdGVtczoge1xuICAgICAgdHlwZTogXCJvYmplY3RcIixcbiAgICAgIHByb3BzOiB7XG4gICAgICAgIHRhc2tJZDogeyB0eXBlOiBcInN0cmluZ1wiLCBlbXB0eTogZmFsc2UgfSxcbiAgICAgICAgZXJyb3I6IHtcbiAgICAgICAgICB0eXBlOiBcIm9iamVjdFwiLFxuICAgICAgICAgIGRlc2NyaXB0aW9uOiBcIkVycm9yIG9iamVjdCBpZiBzb21ldGhpbmcgZ29lcyB3cm9uZy5cIixcbiAgICAgICAgICBwcm9wczoge1xuICAgICAgICAgICAgY29kZToge1xuICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogXCJFcnJvciBjb2RlLlwiLFxuICAgICAgICAgICAgICB0eXBlOiBcInN0cmluZ1wiLFxuICAgICAgICAgICAgICBlbXB0eTogZmFsc2VcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBtZXNzYWdlOiB7XG4gICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBcIkVycm9yIG1lc3NhZ2UuXCIsXG4gICAgICAgICAgICAgIHR5cGU6IFwic3RyaW5nXCIsXG4gICAgICAgICAgICAgIGVtcHR5OiBmYWxzZVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGRldGFpbDoge1xuICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogXCJFcnJvciBkZXRhaWwuXCIsXG4gICAgICAgICAgICAgIHR5cGU6IFwic3RyaW5nXCIsXG4gICAgICAgICAgICAgIG9wdGlvbmFsOiB0cnVlLFxuICAgICAgICAgICAgICBlbXB0eTogZmFsc2VcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9LFxuICAgICAgICAgIG9wdGlvbmFsOiB0cnVlXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cbn07XG5cbmV4cG9ydCB7IENBTkRMRVNfSEFORExFRF9FVkVOVCwgQ0FORExFU19ORVdDQU5ETEVfRVZFTlQgfTtcbiIsImNvbnN0IEJBU0VfRVZFTlQgPSB7XG4gIGlkOiB7XG4gICAgZGVzY3JpcHRpb246IFwiQW4gdW5pcXVlIGlkZW50aWZpZXIgZm9yIHRoZSBldmVudC5cIixcbiAgICB0eXBlOiBcInN0cmluZ1wiLFxuICAgIGVtcHR5OiBmYWxzZVxuICB9LFxuICB0b3BpYzoge1xuICAgIGRlc2NyaXB0aW9uOiBcIlRoZSByZXNvdXJjZSBwYXRoIG9mIHRoZSBldmVudCBzb3VyY2UuXCIsXG4gICAgdHlwZTogXCJzdHJpbmdcIixcbiAgICBlbXB0eTogZmFsc2VcbiAgfSxcbiAgc3ViamVjdDoge1xuICAgIGRlc2NyaXB0aW9uOiBcIkEgcmVzb3VyY2UgcGF0aCByZWxhdGl2ZSB0byB0aGUgdG9waWMgcGF0aC5cIixcbiAgICB0eXBlOiBcInN0cmluZ1wiLFxuICAgIGVtcHR5OiBmYWxzZVxuICB9LFxuICBkYXRhOiB7XG4gICAgZGVzY3JpcHRpb246IFwiRXZlbnQgZGF0YSBzcGVjaWZpYyB0byB0aGUgZXZlbnQgdHlwZS5cIixcbiAgICB0eXBlOiBcIm9iamVjdFwiLFxuICAgIGVtcHR5OiBmYWxzZVxuICB9LFxuICBldmVudFR5cGU6IHtcbiAgICBkZXNjcmlwdGlvbjogXCJUaGUgdHlwZSBvZiB0aGUgZXZlbnQgdGhhdCBvY2N1cnJlZC5cIixcbiAgICB0eXBlOiBcInN0cmluZ1wiLFxuICAgIGVtcHR5OiBmYWxzZVxuICB9LFxuICBldmVudFRpbWU6IHtcbiAgICBkZXNjcmlwdGlvbjogXCJUaGUgdGltZSAoaW4gVVRDKSB0aGUgZXZlbnQgd2FzIGdlbmVyYXRlZC5cIixcbiAgICBmb3JtYXQ6IFwiZGF0ZS10aW1lXCIsXG4gICAgdHlwZTogXCJzdHJpbmdcIixcbiAgICBlbXB0eTogZmFsc2VcbiAgfSxcbiAgbWV0YWRhdGFWZXJzaW9uOiB7XG4gICAgZGVzY3JpcHRpb246IFwiVGhlIHNjaGVtYSB2ZXJzaW9uIG9mIHRoZSBldmVudCBtZXRhZGF0YS5cIixcbiAgICByZWFkT25seTogdHJ1ZSxcbiAgICB0eXBlOiBcInN0cmluZ1wiLFxuICAgIGVtcHR5OiBmYWxzZVxuICB9LFxuICBkYXRhVmVyc2lvbjoge1xuICAgIGRlc2NyaXB0aW9uOiBcIlRoZSBzY2hlbWEgdmVyc2lvbiBvZiB0aGUgZGF0YSBvYmplY3QuXCIsXG4gICAgdHlwZTogXCJzdHJpbmdcIixcbiAgICBlbXB0eTogZmFsc2VcbiAgfVxufTtcbmNvbnN0IFNVQl9WQUxJREFUSU9OX0VWRU5UID0ge1xuICBldmVudFR5cGU6IFwiTWljcm9zb2Z0LkV2ZW50R3JpZC5TdWJzY3JpcHRpb25WYWxpZGF0aW9uRXZlbnRcIlxufTtcblxuY29uc3QgTE9HX01BUktFVFdBVENIRVJfRVZFTlQgPSB7XG4gIGV2ZW50VHlwZTogXCJDUFouTWFya2V0V2F0Y2hlci5Mb2dcIlxufTtcblxuY29uc3QgTE9HX0NBTkRMRUJBVENIRVJfRVZFTlQgPSB7XG4gIGV2ZW50VHlwZTogXCJDUFouQ2FuZGxlYmF0Y2hlci5Mb2dcIlxufTtcblxuY29uc3QgTE9HX0FEVklTRVJfRVZFTlQgPSB7XG4gIGV2ZW50VHlwZTogXCJDUFouQWR2aXNlci5Mb2dcIlxufTtcblxuY29uc3QgTE9HX1RSQURFUl9FVkVOVCA9IHtcbiAgZXZlbnRUeXBlOiBcIkNQWi5UcmFkZXIuTG9nXCJcbn07XG5cbmNvbnN0IEVSUk9SX01BUktFVFdBVENIRVJfRVZFTlQgPSB7XG4gIGV2ZW50VHlwZTogXCJDUFouTWFya2V0V2F0Y2hlci5FcnJvclwiXG59O1xuXG5jb25zdCBFUlJPUl9DQU5ETEVCQVRDSEVSX0VWRU5UID0ge1xuICBldmVudFR5cGU6IFwiQ1BaLkNhbmRsZWJhdGNoZXIuRXJyb3JcIlxufTtcblxuY29uc3QgRVJST1JfQURWSVNFUl9FVkVOVCA9IHtcbiAgZXZlbnRUeXBlOiBcIkNQWi5BZHZpc2VyLkVycm9yXCJcbn07XG5cbmNvbnN0IEVSUk9SX1RSQURFUl9FVkVOVCA9IHtcbiAgZXZlbnRUeXBlOiBcIkNQWi5UcmFkZXIuRXJyb3JcIlxufTtcblxuZXhwb3J0IHtcbiAgQkFTRV9FVkVOVCxcbiAgU1VCX1ZBTElEQVRJT05fRVZFTlQsXG4gIExPR19BRFZJU0VSX0VWRU5ULFxuICBMT0dfQ0FORExFQkFUQ0hFUl9FVkVOVCxcbiAgTE9HX01BUktFVFdBVENIRVJfRVZFTlQsXG4gIExPR19UUkFERVJfRVZFTlQsXG4gIEVSUk9SX0FEVklTRVJfRVZFTlQsXG4gIEVSUk9SX0NBTkRMRUJBVENIRVJfRVZFTlQsXG4gIEVSUk9SX01BUktFVFdBVENIRVJfRVZFTlQsXG4gIEVSUk9SX1RSQURFUl9FVkVOVFxufTtcbiIsImV4cG9ydCAqIGZyb20gXCIuL2NhbmRsZXNcIjtcbmV4cG9ydCAqIGZyb20gXCIuL2V2ZW50c1wiO1xuZXhwb3J0ICogZnJvbSBcIi4vc2lnbmFsc1wiO1xuZXhwb3J0ICogZnJvbSBcIi4vdGFza3NcIjtcbmV4cG9ydCAqIGZyb20gXCIuL3RpY2tzXCI7XG4iLCJjb25zdCBTSUdOQUxTX05FV1NJR05BTF9FVkVOVCA9IHtcbiAgZXZlbnRUeXBlOiBcIkNQWi5TaWduYWxzLk5ld1NpZ25hbFwiLFxuICBzdWJqZWN0OlxuICAgIFwie0V4Y2hhbmdlfS97QXNzZXR9L3tDdXJyZW5jeX0ve1RpbWVmcmFtZX0ve1JvYm90SWR9L3tUYXNrSWR9LntCL0UvUn1cIixcbiAgZGF0YVNjaGVtYToge1xuICAgIHNpZ25hbElkOiB7IGRlc2NyaXB0aW9uOiBcIlVuaXEgQ2FuZGxlIElkLlwiLCB0eXBlOiBcInN0cmluZ1wiLCBlbXB0eTogZmFsc2UgfSxcbiAgICBleGNoYW5nZTogeyBkZXNjcmlwdGlvbjogXCJFeGNoYW5nZSBjb2RlLlwiLCB0eXBlOiBcInN0cmluZ1wiLCBlbXB0eTogZmFsc2UgfSxcbiAgICBhc3NldDogeyBkZXNjcmlwdGlvbjogXCJCYXNlIGN1cnJlbmN5LlwiLCB0eXBlOiBcInN0cmluZ1wiLCBlbXB0eTogZmFsc2UgfSxcbiAgICBjdXJyZW5jeTogeyBkZXNjcmlwdGlvbjogXCJRdW90ZSBjdXJyZW5jeS5cIiwgdHlwZTogXCJzdHJpbmdcIiwgZW1wdHk6IGZhbHNlIH0sXG4gICAgdGltZWZyYW1lOiB7XG4gICAgICBkZXNjcmlwdGlvbjogXCJUaW1lZnJhbWUgaW4gbWludXRlcy5cIixcbiAgICAgIHR5cGU6IFwibnVtYmVyXCJcbiAgICB9LFxuICAgIHJvYm90SWQ6IHtcbiAgICAgIGRlc2NyaXB0aW9uOiBcIlJvYm90IHVuaXEgSWQuXCIsXG4gICAgICB0eXBlOiBcInN0cmluZ1wiLFxuICAgICAgZW1wdHk6IGZhbHNlXG4gICAgfSxcbiAgICBhZHZpc2VySWQ6IHtcbiAgICAgIGRlc2NyaXB0aW9uOiBcIkFkdmlzZXIgdGFzayBJZC5cIixcbiAgICAgIHR5cGU6IFwic3RyaW5nXCIsXG4gICAgICBlbXB0eTogZmFsc2VcbiAgICB9LFxuICAgIGFsZXJ0VGltZToge1xuICAgICAgZGVzY3JpcHRpb246IFwiU2lnbmFsIHRpbWUgaW4gc2Vjb25kcy5cIixcbiAgICAgIHR5cGU6IFwibnVtYmVyXCJcbiAgICB9LFxuICAgIGFjdGlvbjoge1xuICAgICAgZGVzY3JpcHRpb246IFwiU2lnbmFsIHR5cGUuXCIsXG4gICAgICB0eXBlOiBcInN0cmluZ1wiLFxuICAgICAgdmFsdWVzOiBbXCJsb25nXCIsIFwiY2xvc2VMb25nXCIsIFwic2hvcnRcIiwgXCJjbG9zZVNob3J0XCJdXG4gICAgfSxcbiAgICBxdHk6IHtcbiAgICAgIGRlc2NyaXB0aW9uOiBcIlZvbHVtZS5cIixcbiAgICAgIHR5cGU6IFwibnVtYmVyXCIsXG4gICAgICBvcHRpb25hbDogdHJ1ZVxuICAgIH0sXG4gICAgb3JkZXJUeXBlOiB7XG4gICAgICBkZXNjcmlwdGlvbjogXCJPcmRlciB0eXBlLlwiLFxuICAgICAgdHlwZTogXCJzdHJpbmdcIixcbiAgICAgIHZhbHVlczogW1wic3RvcFwiLCBcImxpbWl0XCIsIFwibWFya2V0XCJdLFxuICAgICAgb3B0aW9uYWw6IHRydWVcbiAgICB9LFxuICAgIHByaWNlOiB7XG4gICAgICBkZXNjcmlwdGlvbjogXCJQcmljZSBpbiBxdW90ZSBjdXJyZW5jeS5cIixcbiAgICAgIHR5cGU6IFwibnVtYmVyXCJcbiAgICB9LFxuICAgIHByaWNlU291cmNlOiB7XG4gICAgICBkZXNjcmlwdGlvbjogXCJDYW5kbGUgZmllbGQuXCIsXG4gICAgICB0eXBlOiBcInN0cmluZ1wiLFxuICAgICAgdmFsdWVzOiBbXCJvcGVuXCIsIFwiY2xvc2VcIiwgXCJoaWdoXCIsIFwibG93XCIsIFwic3RvcFwiXVxuICAgIH0sXG4gICAgcG9zaXRpb25JZDoge1xuICAgICAgZGVzY3JpcHRpb246IFwiVW5pcSBwb3NpdGlvbiBJZFwiLFxuICAgICAgdHlwZTogXCJudW1iZXJcIlxuICAgIH0sXG4gICAgY2FuZGxlOiB7XG4gICAgICBkZXNjcmlwdGlvbjogXCJTaWduYWwgZnJvbSBDYW5kbGUuXCIsXG4gICAgICB0eXBlOiBcIm9iamVjdFwiLFxuICAgICAgcHJvcHM6IHtcbiAgICAgICAgdGltZTogeyBkZXNjcmlwdGlvbjogXCJDYW5kbGUgdGltZSBpbiBzZWNvbmRzLlwiLCB0eXBlOiBcIm51bWJlclwiIH0sXG4gICAgICAgIG9wZW46IHsgZGVzY3JpcHRpb246IFwiQ2FuZGxlIE9wZW4gUHJpY2UuXCIsIHR5cGU6IFwibnVtYmVyXCIgfSxcbiAgICAgICAgY2xvc2U6IHsgZGVzY3JpcHRpb246IFwiQ2FuZGxlIENsb3NlIFByaWNlLlwiLCB0eXBlOiBcIm51bWJlclwiIH0sXG4gICAgICAgIGhpZ2g6IHsgZGVzY3JpcHRpb246IFwiQ2FuZGxlIEhpZ2hlc3QgUHJpY2UuXCIsIHR5cGU6IFwibnVtYmVyXCIgfSxcbiAgICAgICAgbG93OiB7IGRlc2NyaXB0aW9uOiBcIlRyYWRlIExvd2VzdCBQcmljZS5cIiwgdHlwZTogXCJudW1iZXJcIiB9LFxuICAgICAgICB2b2x1bWU6IHsgZGVzY3JpcHRpb246IFwiQ2FuZGxlIFZvbHVtZS5cIiwgdHlwZTogXCJudW1iZXJcIiB9XG4gICAgICB9LFxuICAgICAgb3B0aW9uYWw6IHRydWVcbiAgICB9LFxuICAgIHNldHRpbmdzOiB7XG4gICAgICBkZXNjcmlwdGlvbjogXCJUcmFkZXIgcGFyYW1ldGVycy5cIixcbiAgICAgIHR5cGU6IFwib2JqZWN0XCIsXG4gICAgICBwcm9wczoge1xuICAgICAgICBzbGlwcGFnZVN0ZXA6IHtcbiAgICAgICAgICBkZXNjcmlwdGlvbjogXCJQcmljZSBTbGlwcGFnZSBTdGVwLlwiLFxuICAgICAgICAgIHR5cGU6IFwibnVtYmVyXCJcbiAgICAgICAgfSxcbiAgICAgICAgdm9sdW1lOiB7XG4gICAgICAgICAgZGVzY3JpcHRpb246IFwiVXNlciB0cmFkZSB2b2x1bWVcIixcbiAgICAgICAgICB0eXBlOiBcIm51bWJlclwiXG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBvcHRpb25hbDogdHJ1ZVxuICAgIH1cbiAgfVxufTtcbmNvbnN0IFNJR05BTFNfSEFORExFRF9FVkVOVCA9IHtcbiAgZXZlbnRUeXBlOiBcIkNQWi5TaWduYWxzLkhhbmRsZWRcIixcbiAgZGF0YVNjaGVtYToge1xuICAgIHNpZ25hbElkOiB7IGRlc2NyaXB0aW9uOiBcIlVuaXEgU2lnbmFsIElkLlwiLCB0eXBlOiBcInN0cmluZ1wiLCBlbXB0eTogZmFsc2UgfSxcbiAgICBzZXJ2aWNlOiB7XG4gICAgICBkZXNjcmlwdGlvbjogXCJTZXZpY2UgbmFtZSBoYW5kZWxpbmcgZXZlbnRcIixcbiAgICAgIHR5cGU6IFwic3RyaW5nXCIsXG4gICAgICB2YWx1ZXM6IFtcInRyYWRlclwiXVxuICAgIH0sXG4gICAgc3VjY2Vzc1RyYWRlcnM6IHtcbiAgICAgIGRlc2NyaXB0aW9uOiBcIlN1Y2Nlc3MgVHJhZGVycyBleGVjdXRpb24gbGlzdFwiLFxuICAgICAgdHlwZTogXCJhcnJheVwiLFxuICAgICAgaXRlbXM6IFwic3RyaW5nXCJcbiAgICB9LFxuICAgIGVycm9yVHJhZGVyczoge1xuICAgICAgZGVzY3JpcHRpb246IFwiRXJyb3IgVHJhZGVycyBleGVjdXRpb24gbGlzdFwiLFxuICAgICAgdHlwZTogXCJhcnJheVwiLFxuICAgICAgaXRlbXM6IHtcbiAgICAgICAgdHlwZTogXCJvYmplY3RcIixcbiAgICAgICAgcHJvcHM6IHtcbiAgICAgICAgICB0YXNrSWQ6IHsgdHlwZTogXCJzdHJpbmdcIiwgZW1wdHk6IGZhbHNlIH0sXG4gICAgICAgICAgZXJyb3I6IHtcbiAgICAgICAgICAgIHR5cGU6IFwib2JqZWN0XCIsXG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogXCJFcnJvciBvYmplY3QgaWYgc29tZXRoaW5nIGdvZXMgd3JvbmcuXCIsXG4gICAgICAgICAgICBwcm9wczoge1xuICAgICAgICAgICAgICBjb2RlOiB7XG4gICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IFwiRXJyb3IgY29kZS5cIixcbiAgICAgICAgICAgICAgICB0eXBlOiBcInN0cmluZ1wiLFxuICAgICAgICAgICAgICAgIGVtcHR5OiBmYWxzZVxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICBtZXNzYWdlOiB7XG4gICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IFwiRXJyb3IgbWVzc2FnZS5cIixcbiAgICAgICAgICAgICAgICB0eXBlOiBcInN0cmluZ1wiLFxuICAgICAgICAgICAgICAgIGVtcHR5OiBmYWxzZVxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICBkZXRhaWw6IHtcbiAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogXCJFcnJvciBkZXRhaWwuXCIsXG4gICAgICAgICAgICAgICAgdHlwZTogXCJzdHJpbmdcIixcbiAgICAgICAgICAgICAgICBvcHRpb25hbDogdHJ1ZSxcbiAgICAgICAgICAgICAgICBlbXB0eTogZmFsc2VcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIG9wdGlvbmFsOiB0cnVlXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG59O1xuXG5leHBvcnQgeyBTSUdOQUxTX0hBTkRMRURfRVZFTlQsIFNJR05BTFNfTkVXU0lHTkFMX0VWRU5UIH07XG4iLCJjb25zdCBUQVNLU19NQVJLRVRXQVRDSEVSX1NUQVJUX0VWRU5UID0ge1xuICBldmVudFR5cGU6IFwiQ1BaLlRhc2tzLk1hcmtldFdhdGNoZXIuU3RhcnRcIixcbiAgZGF0YVNjaGVtYToge1xuICAgIHRhc2tJZDoge1xuICAgICAgZGVzY3JpcHRpb246IFwiVW5pcSB0YXNrIGlkLlwiLFxuICAgICAgdHlwZTogXCJzdHJpbmdcIixcbiAgICAgIGVtcHR5OiBmYWxzZVxuICAgIH0sXG4gICAgbW9kZToge1xuICAgICAgZGVzY3JpcHRpb246IFwiU2VydmljZSBydW4gbW9kZS5cIixcbiAgICAgIHR5cGU6IFwic3RyaW5nXCIsXG4gICAgICB2YWx1ZXM6IFtcImJhY2t0ZXN0XCIsIFwiZW11bGF0b3JcIiwgXCJyZWFsdGltZVwiXVxuICAgIH0sXG4gICAgZGVidWc6IHtcbiAgICAgIGRlc2NyaXB0aW9uOiBcIkRlYnVnIG1vZGUuXCIsXG4gICAgICB0eXBlOiBcImJvb2xlYW5cIlxuICAgIH0sXG4gICAgcHJvdmlkZXJUeXBlOiB7XG4gICAgICBkZXNjcmlwdGlvbjogXCJEYXRhIHByb3ZpZGVyIHR5cGUuXCIsXG4gICAgICB0eXBlOiBcInN0cmluZ1wiLFxuICAgICAgdmFsdWVzOiBbXCLRgXJ5cHRv0YFvbXBhcmVcIl1cbiAgICB9LFxuICAgIGV4Y2hhbmdlOiB7IGRlc2NyaXB0aW9uOiBcIkV4Y2hhbmdlIGNvZGUuXCIsIHR5cGU6IFwic3RyaW5nXCIsIGVtcHR5OiBmYWxzZSB9LFxuICAgIGFzc2V0OiB7IGRlc2NyaXB0aW9uOiBcIkJhc2UgY3VycmVuY3kuXCIsIHR5cGU6IFwic3RyaW5nXCIsIGVtcHR5OiBmYWxzZSB9LFxuICAgIGN1cnJlbmN5OiB7IGRlc2NyaXB0aW9uOiBcIlF1b3RlIGN1cnJlbmN5LlwiLCB0eXBlOiBcInN0cmluZ1wiLCBlbXB0eTogZmFsc2UgfVxuICB9XG59O1xuY29uc3QgVEFTS1NfTUFSS0VUV0FUQ0hFUl9TVE9QX0VWRU5UID0ge1xuICBldmVudFR5cGU6IFwiQ1BaLlRhc2tzLk1hcmtldFdhdGNoZXIuU3RvcFwiLFxuXG4gIGRhdGFTY2hlbWE6IHtcbiAgICB0YXNrSWQ6IHtcbiAgICAgIGRlc2NyaXB0aW9uOiBcIlVuaXEgdGFzayBpZC5cIixcbiAgICAgIHR5cGU6IFwic3RyaW5nXCIsXG4gICAgICBlbXB0eTogZmFsc2VcbiAgICB9XG4gIH1cbn07XG5jb25zdCBUQVNLU19NQVJLRVRXQVRDSEVSX1NVQlNDUklCRV9FVkVOVCA9IHtcbiAgZXZlbnRUeXBlOiBcIkNQWi5UYXNrcy5NYXJrZXRXYXRjaGVyLlN1YnNjcmliZVwiLFxuXG4gIGRhdGFTY2hlbWE6IHtcbiAgICB0YXNrSWQ6IHtcbiAgICAgIGRlc2NyaXB0aW9uOiBcIlVuaXEgdGFzayBpZC5cIixcbiAgICAgIHR5cGU6IFwic3RyaW5nXCIsXG4gICAgICBlbXB0eTogZmFsc2VcbiAgICB9LFxuICAgIGV4Y2hhbmdlOiB7IGRlc2NyaXB0aW9uOiBcIkV4Y2hhbmdlIGNvZGUuXCIsIHR5cGU6IFwic3RyaW5nXCIsIGVtcHR5OiBmYWxzZSB9LFxuICAgIGFzc2V0OiB7IGRlc2NyaXB0aW9uOiBcIkJhc2UgY3VycmVuY3kuXCIsIHR5cGU6IFwic3RyaW5nXCIsIGVtcHR5OiBmYWxzZSB9LFxuICAgIGN1cnJlbmN5OiB7IGRlc2NyaXB0aW9uOiBcIlF1b3RlIGN1cnJlbmN5LlwiLCB0eXBlOiBcInN0cmluZ1wiLCBlbXB0eTogZmFsc2UgfVxuICB9XG59O1xuY29uc3QgVEFTS1NfTUFSS0VUV0FUQ0hFUl9VTlNVQlNDUklCRV9FVkVOVCA9IHtcbiAgZXZlbnRUeXBlOiBcIkNQWi5UYXNrcy5NYXJrZXRXYXRjaGVyLlVuc3Vic3JpYmVcIixcblxuICBkYXRhU2NoZW1hOiB7XG4gICAgdGFza0lkOiB7XG4gICAgICBkZXNjcmlwdGlvbjogXCJVbmlxIHRhc2sgaWQuXCIsXG4gICAgICB0eXBlOiBcInN0cmluZ1wiLFxuICAgICAgZW1wdHk6IGZhbHNlXG4gICAgfSxcbiAgICBleGNoYW5nZTogeyBkZXNjcmlwdGlvbjogXCJFeGNoYW5nZSBjb2RlLlwiLCB0eXBlOiBcInN0cmluZ1wiLCBlbXB0eTogZmFsc2UgfSxcbiAgICBhc3NldDogeyBkZXNjcmlwdGlvbjogXCJCYXNlIGN1cnJlbmN5LlwiLCB0eXBlOiBcInN0cmluZ1wiLCBlbXB0eTogZmFsc2UgfSxcbiAgICBjdXJyZW5jeTogeyBkZXNjcmlwdGlvbjogXCJRdW90ZSBjdXJyZW5jeS5cIiwgdHlwZTogXCJzdHJpbmdcIiwgZW1wdHk6IGZhbHNlIH1cbiAgfVxufTtcbmNvbnN0IFRBU0tTX01BUktFVFdBVENIRVJfU1RBUlRFRF9FVkVOVCA9IHtcbiAgZXZlbnRUeXBlOiBcIkNQWi5UYXNrcy5NYXJrZXRXYXRjaGVyLlN0YXJ0ZWRcIixcblxuICBkYXRhU2NoZW1hOiB7XG4gICAgdGFza0lkOiB7XG4gICAgICBkZXNjcmlwdGlvbjogXCJVbmlxIHRhc2sgaWQuXCIsXG4gICAgICB0eXBlOiBcInN0cmluZ1wiLFxuICAgICAgZW1wdHk6IGZhbHNlXG4gICAgfSxcbiAgICByb3dLZXk6IHtcbiAgICAgIGRlc2NyaXB0aW9uOiBcIlRhYmxlIHN0b3JhZ2UgdW5pcSByb3cga2V5LlwiLFxuICAgICAgdHlwZTogXCJzdHJpbmdcIixcbiAgICAgIGVtcHR5OiBmYWxzZVxuICAgIH0sXG4gICAgcGFydGl0aW9uS2V5OiB7XG4gICAgICBkZXNjcmlwdGlvbjogXCJUYWJsZSBzdG9yYWdlIHBhcnRpdGlvbiBrZXkuXCIsXG4gICAgICB0eXBlOiBcInN0cmluZ1wiLFxuICAgICAgZW1wdHk6IGZhbHNlXG4gICAgfSxcbiAgICBlcnJvcjoge1xuICAgICAgdHlwZTogXCJvYmplY3RcIixcbiAgICAgIGRlc2NyaXB0aW9uOiBcIkVycm9yIG9iamVjdCBpZiBzb21ldGhpbmcgZ29lcyB3cm9uZy5cIixcbiAgICAgIHByb3BzOiB7XG4gICAgICAgIGNvZGU6IHtcbiAgICAgICAgICBkZXNjcmlwdGlvbjogXCJFcnJvciBjb2RlLlwiLFxuICAgICAgICAgIHR5cGU6IFwic3RyaW5nXCIsXG4gICAgICAgICAgZW1wdHk6IGZhbHNlXG4gICAgICAgIH0sXG4gICAgICAgIG1lc3NhZ2U6IHtcbiAgICAgICAgICBkZXNjcmlwdGlvbjogXCJFcnJvciBtZXNzYWdlLlwiLFxuICAgICAgICAgIHR5cGU6IFwic3RyaW5nXCIsXG4gICAgICAgICAgZW1wdHk6IGZhbHNlXG4gICAgICAgIH0sXG4gICAgICAgIGRldGFpbDoge1xuICAgICAgICAgIGRlc2NyaXB0aW9uOiBcIkVycm9yIGRldGFpbC5cIixcbiAgICAgICAgICB0eXBlOiBcInN0cmluZ1wiLFxuICAgICAgICAgIG9wdGlvbmFsOiB0cnVlLFxuICAgICAgICAgIGVtcHR5OiBmYWxzZVxuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgb3B0aW9uYWw6IHRydWVcbiAgICB9XG4gIH1cbn07XG5jb25zdCBUQVNLU19NQVJLRVRXQVRDSEVSX1NUT1BQRURfRVZFTlQgPSB7XG4gIGV2ZW50VHlwZTogXCJDUFouVGFza3MuTWFya2V0V2F0Y2hlci5TdG9wcGVkXCIsXG5cbiAgZGF0YVNjaGVtYToge1xuICAgIHRhc2tJZDoge1xuICAgICAgZGVzY3JpcHRpb246IFwiVW5pcSB0YXNrIGlkLiAtICduYW1lUHJvdmlkZXInXCIsXG4gICAgICB0eXBlOiBcInN0cmluZ1wiLFxuICAgICAgZW1wdHk6IGZhbHNlXG4gICAgfSxcbiAgICBlcnJvcjoge1xuICAgICAgdHlwZTogXCJvYmplY3RcIixcbiAgICAgIGRlc2NyaXB0aW9uOiBcIkVycm9yIG9iamVjdCBpZiBzb21ldGhpbmcgZ29lcyB3cm9uZy5cIixcbiAgICAgIHByb3BzOiB7XG4gICAgICAgIGNvZGU6IHtcbiAgICAgICAgICBkZXNjcmlwdGlvbjogXCJFcnJvciBjb2RlLlwiLFxuICAgICAgICAgIHR5cGU6IFwic3RyaW5nXCIsXG4gICAgICAgICAgZW1wdHk6IGZhbHNlXG4gICAgICAgIH0sXG4gICAgICAgIG1lc3NhZ2U6IHtcbiAgICAgICAgICBkZXNjcmlwdGlvbjogXCJFcnJvciBtZXNzYWdlLlwiLFxuICAgICAgICAgIHR5cGU6IFwic3RyaW5nXCIsXG4gICAgICAgICAgZW1wdHk6IGZhbHNlXG4gICAgICAgIH0sXG4gICAgICAgIGRldGFpbDoge1xuICAgICAgICAgIGRlc2NyaXB0aW9uOiBcIkVycm9yIGRldGFpbC5cIixcbiAgICAgICAgICB0eXBlOiBcInN0cmluZ1wiLFxuICAgICAgICAgIG9wdGlvbmFsOiB0cnVlLFxuICAgICAgICAgIGVtcHR5OiBmYWxzZVxuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgb3B0aW9uYWw6IHRydWVcbiAgICB9XG4gIH1cbn07XG5jb25zdCBUQVNLU19NQVJLRVRXQVRDSEVSX1NVQlNDUklCRURfRVZFTlQgPSB7XG4gIGV2ZW50VHlwZTogXCJDUFouVGFza3MuTWFya2V0V2F0Y2hlci5TdWJzY3JpYmVkXCIsXG5cbiAgZGF0YVNjaGVtYToge1xuICAgIHRhc2tJZDoge1xuICAgICAgZGVzY3JpcHRpb246IFwiVW5pcSB0YXNrIGlkLiAtICduYW1lUHJvdmlkZXInXCIsXG4gICAgICB0eXBlOiBcInN0cmluZ1wiLFxuICAgICAgZW1wdHk6IGZhbHNlXG4gICAgfSxcbiAgICBlcnJvcjoge1xuICAgICAgdHlwZTogXCJvYmplY3RcIixcbiAgICAgIGRlc2NyaXB0aW9uOiBcIkVycm9yIG9iamVjdCBpZiBzb21ldGhpbmcgZ29lcyB3cm9uZy5cIixcbiAgICAgIHByb3BzOiB7XG4gICAgICAgIGNvZGU6IHtcbiAgICAgICAgICBkZXNjcmlwdGlvbjogXCJFcnJvciBjb2RlLlwiLFxuICAgICAgICAgIHR5cGU6IFwic3RyaW5nXCIsXG4gICAgICAgICAgZW1wdHk6IGZhbHNlXG4gICAgICAgIH0sXG4gICAgICAgIG1lc3NhZ2U6IHtcbiAgICAgICAgICBkZXNjcmlwdGlvbjogXCJFcnJvciBtZXNzYWdlLlwiLFxuICAgICAgICAgIHR5cGU6IFwic3RyaW5nXCIsXG4gICAgICAgICAgZW1wdHk6IGZhbHNlXG4gICAgICAgIH0sXG4gICAgICAgIGRldGFpbDoge1xuICAgICAgICAgIGRlc2NyaXB0aW9uOiBcIkVycm9yIGRldGFpbC5cIixcbiAgICAgICAgICB0eXBlOiBcInN0cmluZ1wiLFxuICAgICAgICAgIG9wdGlvbmFsOiB0cnVlLFxuICAgICAgICAgIGVtcHR5OiBmYWxzZVxuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgb3B0aW9uYWw6IHRydWVcbiAgICB9XG4gIH1cbn07XG5jb25zdCBUQVNLU19NQVJLRVRXQVRDSEVSX1VOU1VCU0NSSUJFRF9FVkVOVCA9IHtcbiAgZXZlbnRUeXBlOiBcIkNQWi5UYXNrcy5NYXJrZXRXYXRjaGVyLlVuc3Vic2NyaWJlZFwiLFxuXG4gIGRhdGFTY2hlbWE6IHtcbiAgICB0YXNrSWQ6IHtcbiAgICAgIGRlc2NyaXB0aW9uOiBcIlVuaXEgdGFzayBpZC5cIixcbiAgICAgIHR5cGU6IFwic3RyaW5nXCIsXG4gICAgICBlbXB0eTogZmFsc2VcbiAgICB9LFxuICAgIGVycm9yOiB7XG4gICAgICB0eXBlOiBcIm9iamVjdFwiLFxuICAgICAgZGVzY3JpcHRpb246IFwiRXJyb3Igb2JqZWN0IGlmIHNvbWV0aGluZyBnb2VzIHdyb25nLlwiLFxuICAgICAgcHJvcHM6IHtcbiAgICAgICAgY29kZToge1xuICAgICAgICAgIGRlc2NyaXB0aW9uOiBcIkVycm9yIGNvZGUuXCIsXG4gICAgICAgICAgdHlwZTogXCJzdHJpbmdcIixcbiAgICAgICAgICBlbXB0eTogZmFsc2VcbiAgICAgICAgfSxcbiAgICAgICAgbWVzc2FnZToge1xuICAgICAgICAgIGRlc2NyaXB0aW9uOiBcIkVycm9yIG1lc3NhZ2UuXCIsXG4gICAgICAgICAgdHlwZTogXCJzdHJpbmdcIixcbiAgICAgICAgICBlbXB0eTogZmFsc2VcbiAgICAgICAgfSxcbiAgICAgICAgZGV0YWlsOiB7XG4gICAgICAgICAgZGVzY3JpcHRpb246IFwiRXJyb3IgZGV0YWlsLlwiLFxuICAgICAgICAgIHR5cGU6IFwic3RyaW5nXCIsXG4gICAgICAgICAgb3B0aW9uYWw6IHRydWUsXG4gICAgICAgICAgZW1wdHk6IGZhbHNlXG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBvcHRpb25hbDogdHJ1ZVxuICAgIH1cbiAgfVxufTtcblxuY29uc3QgVEFTS1NfQ0FORExFQkFUQ0hFUl9TVEFSVF9FVkVOVCA9IHtcbiAgZXZlbnRUeXBlOiBcIkNQWi5UYXNrcy5DYW5kbGViYXRjaGVyLlN0YXJ0XCIsXG5cbiAgZGF0YVNjaGVtYToge1xuICAgIHRhc2tJZDoge1xuICAgICAgZGVzY3JpcHRpb246IFwiVW5pcSB0YXNrIGlkLlwiLFxuICAgICAgdHlwZTogXCJzdHJpbmdcIixcbiAgICAgIGVtcHR5OiBmYWxzZVxuICAgIH0sXG4gICAgbW9kZToge1xuICAgICAgZGVzY3JpcHRpb246IFwiU2VydmljZSBydW4gbW9kZS5cIixcbiAgICAgIHR5cGU6IFwic3RyaW5nXCIsXG4gICAgICB2YWx1ZXM6IFtcImJhY2t0ZXN0XCIsIFwiZW11bGF0b3JcIiwgXCJyZWFsdGltZVwiXVxuICAgIH0sXG4gICAgZGVidWc6IHtcbiAgICAgIGRlc2NyaXB0aW9uOiBcIkRlYnVnIG1vZGUuXCIsXG4gICAgICB0eXBlOiBcImJvb2xlYW5cIlxuICAgIH0sXG4gICAgcHJvdmlkZXJUeXBlOiB7XG4gICAgICBkZXNjcmlwdGlvbjogXCJEYXRhIHByb3ZpZGVyIHR5cGUuXCIsXG4gICAgICB0eXBlOiBcInN0cmluZ1wiLFxuICAgICAgdmFsdWVzOiBbXCJjcnlwdG9jb21wYXJlXCIsIFwiY2N4dFwiXVxuICAgIH0sXG4gICAgZXhjaGFuZ2U6IHsgZGVzY3JpcHRpb246IFwiRXhjaGFuZ2UgY29kZS5cIiwgdHlwZTogXCJzdHJpbmdcIiwgZW1wdHk6IGZhbHNlIH0sXG4gICAgYXNzZXQ6IHsgZGVzY3JpcHRpb246IFwiQmFzZSBjdXJyZW5jeS5cIiwgdHlwZTogXCJzdHJpbmdcIiwgZW1wdHk6IGZhbHNlIH0sXG4gICAgY3VycmVuY3k6IHsgZGVzY3JpcHRpb246IFwiUXVvdGUgY3VycmVuY3kuXCIsIHR5cGU6IFwic3RyaW5nXCIsIGVtcHR5OiBmYWxzZSB9LFxuICAgIHRpbWVmcmFtZXM6IHtcbiAgICAgIGRlc2NyaXB0aW9uOiBcIkxpc3Qgb2YgdGltZWZyYW1lcyBpbiBtaW51dGVzLlwiLFxuICAgICAgdHlwZTogXCJhcnJheVwiLFxuICAgICAgaXRlbXM6IFwibnVtYmVyXCJcbiAgICB9LFxuICAgIHByb3h5OiB7XG4gICAgICBkZXNjcmlwdGlvbjogXCJQcm94eSBlbmRwb2ludC5cIixcbiAgICAgIHR5cGU6IFwic3RyaW5nXCIsXG4gICAgICBvcHRpb25hbDogdHJ1ZSxcbiAgICAgIGVtcHR5OiBmYWxzZVxuICAgIH1cbiAgfVxufTtcbmNvbnN0IFRBU0tTX0NBTkRMRUJBVENIRVJfU1RPUF9FVkVOVCA9IHtcbiAgZXZlbnRUeXBlOiBcIkNQWi5UYXNrcy5DYW5kbGViYXRjaGVyLlN0b3BcIixcbiAgc3ViamVjdDogXCJ7RXhjaGFuZ2V9L3tBc3NldH0ve0N1cnJlbmN5fS97VGFza0lkfS57Qi9FL1J9XCIsXG4gIGRhdGFTY2hlbWE6IHtcbiAgICB0YXNrSWQ6IHtcbiAgICAgIGRlc2NyaXB0aW9uOiBcIlVuaXEgdGFzayBpZC5cIixcbiAgICAgIHR5cGU6IFwic3RyaW5nXCIsXG4gICAgICBlbXB0eTogZmFsc2VcbiAgICB9LFxuICAgIHJvd0tleToge1xuICAgICAgZGVzY3JpcHRpb246IFwiVGFibGUgc3RvcmFnZSB1bmlxIHJvdyBrZXkuXCIsXG4gICAgICB0eXBlOiBcInN0cmluZ1wiLFxuICAgICAgZW1wdHk6IGZhbHNlXG4gICAgfSxcbiAgICBwYXJ0aXRpb25LZXk6IHtcbiAgICAgIGRlc2NyaXB0aW9uOiBcIlRhYmxlIHN0b3JhZ2UgcGFydGl0aW9uIGtleS5cIixcbiAgICAgIHR5cGU6IFwic3RyaW5nXCIsXG4gICAgICBlbXB0eTogZmFsc2VcbiAgICB9XG4gIH1cbn07XG5jb25zdCBUQVNLU19DQU5ETEVCQVRDSEVSX1VQREFURV9FVkVOVCA9IHtcbiAgZXZlbnRUeXBlOiBcIkNQWi5UYXNrcy5DYW5kbGViYXRjaGVyLlVwZGF0ZVwiLFxuXG4gIGRhdGFTY2hlbWE6IHtcbiAgICB0YXNrSWQ6IHtcbiAgICAgIGRlc2NyaXB0aW9uOiBcIlVuaXEgdGFzayBpZC5cIixcbiAgICAgIHR5cGU6IFwic3RyaW5nXCIsXG4gICAgICBlbXB0eTogZmFsc2VcbiAgICB9LFxuICAgIHJvd0tleToge1xuICAgICAgZGVzY3JpcHRpb246IFwiVGFibGUgc3RvcmFnZSB1bmlxIHJvdyBrZXkuXCIsXG4gICAgICB0eXBlOiBcInN0cmluZ1wiLFxuICAgICAgZW1wdHk6IGZhbHNlXG4gICAgfSxcbiAgICBwYXJ0aXRpb25LZXk6IHtcbiAgICAgIGRlc2NyaXB0aW9uOiBcIlRhYmxlIHN0b3JhZ2UgcGFydGl0aW9uIGtleS5cIixcbiAgICAgIHR5cGU6IFwic3RyaW5nXCIsXG4gICAgICBlbXB0eTogZmFsc2VcbiAgICB9LFxuICAgIGRlYnVnOiB7XG4gICAgICBkZXNjcmlwdGlvbjogXCJEZWJ1ZyBtb2RlLlwiLFxuICAgICAgdHlwZTogXCJib29sZWFuXCJcbiAgICB9LFxuICAgIHRpbWVmcmFtZXM6IHtcbiAgICAgIGRlc2NyaXB0aW9uOiBcIkxpc3Qgb2YgdGltZWZyYW1lcyBpbiBtaW51dGVzLlwiLFxuICAgICAgdHlwZTogXCJhcnJheVwiLFxuICAgICAgaXRlbXM6IFwibnVtYmVyXCJcbiAgICB9LFxuICAgIHByb3h5OiB7XG4gICAgICBkZXNjcmlwdGlvbjogXCJQcm94eSBlbmRwb2ludC5cIixcbiAgICAgIHR5cGU6IFwic3RyaW5nXCIsXG4gICAgICBvcHRpb25hbDogdHJ1ZSxcbiAgICAgIGVtcHR5OiBmYWxzZVxuICAgIH1cbiAgfVxufTtcbmNvbnN0IFRBU0tTX0NBTkRMRUJBVENIRVJfU1RBUlRFRF9FVkVOVCA9IHtcbiAgZXZlbnRUeXBlOiBcIkNQWi5UYXNrcy5DYW5kbGViYXRjaGVyLlN0YXJ0ZWRcIixcblxuICBkYXRhU2NoZW1hOiB7XG4gICAgdGFza0lkOiB7XG4gICAgICBkZXNjcmlwdGlvbjogXCJVbmlxIHRhc2sgaWQuXCIsXG4gICAgICB0eXBlOiBcInN0cmluZ1wiLFxuICAgICAgZW1wdHk6IGZhbHNlXG4gICAgfSxcbiAgICByb3dLZXk6IHtcbiAgICAgIGRlc2NyaXB0aW9uOiBcIlRhYmxlIHN0b3JhZ2UgdW5pcSByb3cga2V5LlwiLFxuICAgICAgdHlwZTogXCJzdHJpbmdcIixcbiAgICAgIGVtcHR5OiBmYWxzZVxuICAgIH0sXG4gICAgcGFydGl0aW9uS2V5OiB7XG4gICAgICBkZXNjcmlwdGlvbjogXCJUYWJsZSBzdG9yYWdlIHBhcnRpdGlvbiBrZXkuXCIsXG4gICAgICB0eXBlOiBcInN0cmluZ1wiLFxuICAgICAgZW1wdHk6IGZhbHNlXG4gICAgfSxcbiAgICBlcnJvcjoge1xuICAgICAgdHlwZTogXCJvYmplY3RcIixcbiAgICAgIGRlc2NyaXB0aW9uOiBcIkVycm9yIG9iamVjdCBpZiBzb21ldGhpbmcgZ29lcyB3cm9uZy5cIixcbiAgICAgIHByb3BzOiB7XG4gICAgICAgIGNvZGU6IHtcbiAgICAgICAgICBkZXNjcmlwdGlvbjogXCJFcnJvciBjb2RlLlwiLFxuICAgICAgICAgIHR5cGU6IFwic3RyaW5nXCIsXG4gICAgICAgICAgZW1wdHk6IGZhbHNlXG4gICAgICAgIH0sXG4gICAgICAgIG1lc3NhZ2U6IHtcbiAgICAgICAgICBkZXNjcmlwdGlvbjogXCJFcnJvciBtZXNzYWdlLlwiLFxuICAgICAgICAgIHR5cGU6IFwic3RyaW5nXCIsXG4gICAgICAgICAgZW1wdHk6IGZhbHNlXG4gICAgICAgIH0sXG4gICAgICAgIGRldGFpbDoge1xuICAgICAgICAgIGRlc2NyaXB0aW9uOiBcIkVycm9yIGRldGFpbC5cIixcbiAgICAgICAgICB0eXBlOiBcInN0cmluZ1wiLFxuICAgICAgICAgIG9wdGlvbmFsOiB0cnVlLFxuICAgICAgICAgIGVtcHR5OiBmYWxzZVxuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgb3B0aW9uYWw6IHRydWVcbiAgICB9XG4gIH1cbn07XG5jb25zdCBUQVNLU19DQU5ETEVCQVRDSEVSX1NUT1BQRURfRVZFTlQgPSB7XG4gIGV2ZW50VHlwZTogXCJDUFouVGFza3MuQ2FuZGxlYmF0Y2hlci5TdG9wcGVkXCIsXG5cbiAgZGF0YVNjaGVtYToge1xuICAgIHRhc2tJZDoge1xuICAgICAgZGVzY3JpcHRpb246IFwiVW5pcSB0YXNrIGlkLlwiLFxuICAgICAgdHlwZTogXCJzdHJpbmdcIixcbiAgICAgIGVtcHR5OiBmYWxzZVxuICAgIH0sXG4gICAgZXJyb3I6IHtcbiAgICAgIHR5cGU6IFwib2JqZWN0XCIsXG4gICAgICBkZXNjcmlwdGlvbjogXCJFcnJvciBvYmplY3QgaWYgc29tZXRoaW5nIGdvZXMgd3JvbmcuXCIsXG4gICAgICBwcm9wczoge1xuICAgICAgICBjb2RlOiB7XG4gICAgICAgICAgZGVzY3JpcHRpb246IFwiRXJyb3IgY29kZS5cIixcbiAgICAgICAgICB0eXBlOiBcInN0cmluZ1wiLFxuICAgICAgICAgIGVtcHR5OiBmYWxzZVxuICAgICAgICB9LFxuICAgICAgICBtZXNzYWdlOiB7XG4gICAgICAgICAgZGVzY3JpcHRpb246IFwiRXJyb3IgbWVzc2FnZS5cIixcbiAgICAgICAgICB0eXBlOiBcInN0cmluZ1wiLFxuICAgICAgICAgIGVtcHR5OiBmYWxzZVxuICAgICAgICB9LFxuICAgICAgICBkZXRhaWw6IHtcbiAgICAgICAgICBkZXNjcmlwdGlvbjogXCJFcnJvciBkZXRhaWwuXCIsXG4gICAgICAgICAgdHlwZTogXCJzdHJpbmdcIixcbiAgICAgICAgICBvcHRpb25hbDogdHJ1ZSxcbiAgICAgICAgICBlbXB0eTogZmFsc2VcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIG9wdGlvbmFsOiB0cnVlXG4gICAgfVxuICB9XG59O1xuY29uc3QgVEFTS1NfQ0FORExFQkFUQ0hFUl9VUERBVEVEX0VWRU5UID0ge1xuICBldmVudFR5cGU6IFwiQ1BaLlRhc2tzLkNhbmRsZWJhdGNoZXIuVXBkYXRlZFwiLFxuXG4gIGRhdGFTY2hlbWE6IHtcbiAgICB0YXNrSWQ6IHtcbiAgICAgIGRlc2NyaXB0aW9uOiBcIlVuaXEgdGFzayBpZC5cIixcbiAgICAgIHR5cGU6IFwic3RyaW5nXCIsXG4gICAgICBlbXB0eTogZmFsc2VcbiAgICB9LFxuICAgIGVycm9yOiB7XG4gICAgICB0eXBlOiBcIm9iamVjdFwiLFxuICAgICAgZGVzY3JpcHRpb246IFwiRXJyb3Igb2JqZWN0IGlmIHNvbWV0aGluZyBnb2VzIHdyb25nLlwiLFxuICAgICAgcHJvcHM6IHtcbiAgICAgICAgY29kZToge1xuICAgICAgICAgIGRlc2NyaXB0aW9uOiBcIkVycm9yIGNvZGUuXCIsXG4gICAgICAgICAgdHlwZTogXCJzdHJpbmdcIixcbiAgICAgICAgICBlbXB0eTogZmFsc2VcbiAgICAgICAgfSxcbiAgICAgICAgbWVzc2FnZToge1xuICAgICAgICAgIGRlc2NyaXB0aW9uOiBcIkVycm9yIG1lc3NhZ2UuXCIsXG4gICAgICAgICAgdHlwZTogXCJzdHJpbmdcIixcbiAgICAgICAgICBlbXB0eTogZmFsc2VcbiAgICAgICAgfSxcbiAgICAgICAgZGV0YWlsOiB7XG4gICAgICAgICAgZGVzY3JpcHRpb246IFwiRXJyb3IgZGV0YWlsLlwiLFxuICAgICAgICAgIHR5cGU6IFwic3RyaW5nXCIsXG4gICAgICAgICAgb3B0aW9uYWw6IHRydWUsXG4gICAgICAgICAgZW1wdHk6IGZhbHNlXG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBvcHRpb25hbDogdHJ1ZVxuICAgIH1cbiAgfVxufTtcbmNvbnN0IFRBU0tTX0FEVklTRVJfU1RBUlRfRVZFTlQgPSB7XG4gIGV2ZW50VHlwZTogXCJDUFouVGFza3MuQWR2aXNlci5TdGFydFwiLFxuXG4gIGRhdGFTY2hlbWE6IHtcbiAgICB0YXNrSWQ6IHtcbiAgICAgIGRlc2NyaXB0aW9uOiBcIlVuaXEgdGFzayBpZC5cIixcbiAgICAgIHR5cGU6IFwic3RyaW5nXCIsXG4gICAgICBlbXB0eTogZmFsc2VcbiAgICB9LFxuICAgIHJvYm90SWQ6IHtcbiAgICAgIGRlc2NyaXB0aW9uOiBcIlJvYm90IHVuaXEgSWQuXCIsXG4gICAgICB0eXBlOiBcInN0cmluZ1wiLFxuICAgICAgZW1wdHk6IGZhbHNlXG4gICAgfSxcbiAgICBtb2RlOiB7XG4gICAgICBkZXNjcmlwdGlvbjogXCJTZXJ2aWNlIHJ1biBtb2RlLlwiLFxuICAgICAgdHlwZTogXCJzdHJpbmdcIixcbiAgICAgIHZhbHVlczogW1wiYmFja3Rlc3RcIiwgXCJlbXVsYXRvclwiLCBcInJlYWx0aW1lXCJdXG4gICAgfSxcbiAgICBkZWJ1Zzoge1xuICAgICAgZGVzY3JpcHRpb246IFwiRGVidWcgbW9kZS5cIixcbiAgICAgIHR5cGU6IFwiYm9vbGVhblwiLFxuICAgICAgZW1wdHk6IGZhbHNlXG4gICAgfSxcbiAgICBzdHJhdGVneToge1xuICAgICAgZGVzY3JpcHRpb246IFwiU3RyYXRlZ3kgZmlsZSBuYW1lLlwiLFxuICAgICAgdHlwZTogXCJzdHJpbmdcIixcbiAgICAgIGVtcHR5OiBmYWxzZVxuICAgIH0sXG4gICAgZXhjaGFuZ2U6IHsgZGVzY3JpcHRpb246IFwiRXhjaGFuZ2UgY29kZS5cIiwgdHlwZTogXCJzdHJpbmdcIiwgZW1wdHk6IGZhbHNlIH0sXG4gICAgYXNzZXQ6IHsgZGVzY3JpcHRpb246IFwiQmFzZSBjdXJyZW5jeS5cIiwgdHlwZTogXCJzdHJpbmdcIiwgZW1wdHk6IGZhbHNlIH0sXG4gICAgY3VycmVuY3k6IHsgZGVzY3JpcHRpb246IFwiUXVvdGUgY3VycmVuY3kuXCIsIHR5cGU6IFwic3RyaW5nXCIsIGVtcHR5OiBmYWxzZSB9LFxuICAgIHRpbWVmcmFtZToge1xuICAgICAgZGVzY3JpcHRpb246IFwiVGltZWZyYW1lIGluIG1pbnV0ZXMuXCIsXG4gICAgICB0eXBlOiBcIm51bWJlclwiXG4gICAgfSxcbiAgICBzZXR0aW5nczoge1xuICAgICAgZGVzY3JpcHRpb246IFwiQWR2aXNlciBwYXJhbWV0ZXJzLlwiLFxuICAgICAgdHlwZTogXCJvYmplY3RcIlxuICAgIH1cbiAgfVxufTtcbmNvbnN0IFRBU0tTX0FEVklTRVJfU1RPUF9FVkVOVCA9IHtcbiAgZXZlbnRUeXBlOiBcIkNQWi5UYXNrcy5BZHZpc2VyLlN0b3BcIixcblxuICBkYXRhU2NoZW1hOiB7XG4gICAgdGFza0lkOiB7XG4gICAgICBkZXNjcmlwdGlvbjogXCJVbmlxIHRhc2sgaWQuXCIsXG4gICAgICB0eXBlOiBcInN0cmluZ1wiLFxuICAgICAgZW1wdHk6IGZhbHNlXG4gICAgfSxcbiAgICByb3dLZXk6IHtcbiAgICAgIGRlc2NyaXB0aW9uOiBcIlRhYmxlIHN0b3JhZ2UgdW5pcSByb3cga2V5LlwiLFxuICAgICAgdHlwZTogXCJzdHJpbmdcIixcbiAgICAgIGVtcHR5OiBmYWxzZVxuICAgIH0sXG4gICAgcGFydGl0aW9uS2V5OiB7XG4gICAgICBkZXNjcmlwdGlvbjogXCJUYWJsZSBzdG9yYWdlIHBhcnRpdGlvbiBrZXkuXCIsXG4gICAgICB0eXBlOiBcInN0cmluZ1wiLFxuICAgICAgZW1wdHk6IGZhbHNlXG4gICAgfVxuICB9XG59O1xuY29uc3QgVEFTS1NfQURWSVNFUl9VUERBVEVfRVZFTlQgPSB7XG4gIGV2ZW50VHlwZTogXCJDUFouVGFza3MuQWR2aXNlci5VcGRhdGVcIixcblxuICBkYXRhU2NoZW1hOiB7XG4gICAgdGFza0lkOiB7XG4gICAgICBkZXNjcmlwdGlvbjogXCJVbmlxIHRhc2sgaWQuXCIsXG4gICAgICB0eXBlOiBcInN0cmluZ1wiLFxuICAgICAgZW1wdHk6IGZhbHNlXG4gICAgfSxcbiAgICByb3dLZXk6IHtcbiAgICAgIGRlc2NyaXB0aW9uOiBcIlRhYmxlIHN0b3JhZ2UgdW5pcSByb3cga2V5LlwiLFxuICAgICAgdHlwZTogXCJzdHJpbmdcIixcbiAgICAgIGVtcHR5OiBmYWxzZVxuICAgIH0sXG4gICAgcGFydGl0aW9uS2V5OiB7XG4gICAgICBkZXNjcmlwdGlvbjogXCJUYWJsZSBzdG9yYWdlIHBhcnRpdGlvbiBrZXkuXCIsXG4gICAgICB0eXBlOiBcInN0cmluZ1wiLFxuICAgICAgZW1wdHk6IGZhbHNlXG4gICAgfSxcbiAgICBkZWJ1Zzoge1xuICAgICAgZGVzY3JpcHRpb246IFwiRGVidWcgbW9kZS5cIixcbiAgICAgIHR5cGU6IFwiYm9vbGVhblwiXG4gICAgfSxcbiAgICBzZXR0aW5nczoge1xuICAgICAgZGVzY3JpcHRpb246IFwiQWR2aXNlciBwYXJhbWV0ZXJzLlwiLFxuICAgICAgdHlwZTogXCJvYmplY3RcIlxuICAgIH1cbiAgfVxufTtcbmNvbnN0IFRBU0tTX0FEVklTRVJfU1RBUlRFRF9FVkVOVCA9IHtcbiAgZXZlbnRUeXBlOiBcIkNQWi5UYXNrcy5BZHZpc2VyLlN0YXJ0ZWRcIixcblxuICBkYXRhU2NoZW1hOiB7XG4gICAgdGFza0lkOiB7XG4gICAgICBkZXNjcmlwdGlvbjogXCJVbmlxIHRhc2sgaWQuXCIsXG4gICAgICB0eXBlOiBcInN0cmluZ1wiLFxuICAgICAgZW1wdHk6IGZhbHNlXG4gICAgfSxcbiAgICByb3dLZXk6IHtcbiAgICAgIGRlc2NyaXB0aW9uOiBcIlRhYmxlIHN0b3JhZ2UgdW5pcSByb3cga2V5LlwiLFxuICAgICAgdHlwZTogXCJzdHJpbmdcIixcbiAgICAgIGVtcHR5OiBmYWxzZVxuICAgIH0sXG4gICAgcGFydGl0aW9uS2V5OiB7XG4gICAgICBkZXNjcmlwdGlvbjogXCJUYWJsZSBzdG9yYWdlIHBhcnRpdGlvbiBrZXkuXCIsXG4gICAgICB0eXBlOiBcInN0cmluZ1wiLFxuICAgICAgZW1wdHk6IGZhbHNlXG4gICAgfSxcbiAgICBlcnJvcjoge1xuICAgICAgdHlwZTogXCJvYmplY3RcIixcbiAgICAgIGRlc2NyaXB0aW9uOiBcIkVycm9yIG9iamVjdCBpZiBzb21ldGhpbmcgZ29lcyB3cm9uZy5cIixcbiAgICAgIHByb3BzOiB7XG4gICAgICAgIGNvZGU6IHtcbiAgICAgICAgICBkZXNjcmlwdGlvbjogXCJFcnJvciBjb2RlLlwiLFxuICAgICAgICAgIHR5cGU6IFwic3RyaW5nXCJcbiAgICAgICAgfSxcbiAgICAgICAgbWVzc2FnZToge1xuICAgICAgICAgIGRlc2NyaXB0aW9uOiBcIkVycm9yIG1lc3NhZ2UuXCIsXG4gICAgICAgICAgdHlwZTogXCJzdHJpbmdcIlxuICAgICAgICB9LFxuICAgICAgICBkZXRhaWw6IHtcbiAgICAgICAgICBkZXNjcmlwdGlvbjogXCJFcnJvciBkZXRhaWwuXCIsXG4gICAgICAgICAgdHlwZTogXCJzdHJpbmdcIixcbiAgICAgICAgICBvcHRpb25hbDogdHJ1ZSxcbiAgICAgICAgICBlbXB0eTogZmFsc2VcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIG9wdGlvbmFsOiB0cnVlXG4gICAgfVxuICB9XG59O1xuY29uc3QgVEFTS1NfQURWSVNFUl9TVE9QUEVEX0VWRU5UID0ge1xuICBldmVudFR5cGU6IFwiQ1BaLlRhc2tzLkFkdmlzZXIuU3RvcHBlZFwiLFxuXG4gIGRhdGFTY2hlbWE6IHtcbiAgICB0YXNrSWQ6IHtcbiAgICAgIGRlc2NyaXB0aW9uOiBcIlVuaXEgdGFzayBpZC5cIixcbiAgICAgIHR5cGU6IFwic3RyaW5nXCIsXG4gICAgICBlbXB0eTogZmFsc2VcbiAgICB9LFxuICAgIGVycm9yOiB7XG4gICAgICB0eXBlOiBcIm9iamVjdFwiLFxuICAgICAgZGVzY3JpcHRpb246IFwiRXJyb3Igb2JqZWN0IGlmIHNvbWV0aGluZyBnb2VzIHdyb25nLlwiLFxuICAgICAgcHJvcHM6IHtcbiAgICAgICAgY29kZToge1xuICAgICAgICAgIGRlc2NyaXB0aW9uOiBcIkVycm9yIGNvZGUuXCIsXG4gICAgICAgICAgdHlwZTogXCJzdHJpbmdcIixcbiAgICAgICAgICBlbXB0eTogZmFsc2VcbiAgICAgICAgfSxcbiAgICAgICAgbWVzc2FnZToge1xuICAgICAgICAgIGRlc2NyaXB0aW9uOiBcIkVycm9yIG1lc3NhZ2UuXCIsXG4gICAgICAgICAgdHlwZTogXCJzdHJpbmdcIixcbiAgICAgICAgICBlbXB0eTogZmFsc2VcbiAgICAgICAgfSxcbiAgICAgICAgZGV0YWlsOiB7XG4gICAgICAgICAgZGVzY3JpcHRpb246IFwiRXJyb3IgZGV0YWlsLlwiLFxuICAgICAgICAgIHR5cGU6IFwic3RyaW5nXCIsXG4gICAgICAgICAgb3B0aW9uYWw6IHRydWUsXG4gICAgICAgICAgZW1wdHk6IGZhbHNlXG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBvcHRpb25hbDogdHJ1ZVxuICAgIH1cbiAgfVxufTtcbmNvbnN0IFRBU0tTX0FEVklTRVJfVVBEQVRFRF9FVkVOVCA9IHtcbiAgZXZlbnRUeXBlOiBcIkNQWi5UYXNrcy5BZHZpc2VyLlVwZGF0ZWRcIixcblxuICBkYXRhU2NoZW1hOiB7XG4gICAgdGFza0lkOiB7XG4gICAgICBkZXNjcmlwdGlvbjogXCJVbmlxIHRhc2sgaWQuXCIsXG4gICAgICB0eXBlOiBcInN0cmluZ1wiLFxuICAgICAgZW1wdHk6IGZhbHNlXG4gICAgfSxcbiAgICBlcnJvcjoge1xuICAgICAgdHlwZTogXCJvYmplY3RcIixcbiAgICAgIGRlc2NyaXB0aW9uOiBcIkVycm9yIG9iamVjdCBpZiBzb21ldGhpbmcgZ29lcyB3cm9uZy5cIixcbiAgICAgIHByb3BzOiB7XG4gICAgICAgIGNvZGU6IHtcbiAgICAgICAgICBkZXNjcmlwdGlvbjogXCJFcnJvciBjb2RlLlwiLFxuICAgICAgICAgIHR5cGU6IFwic3RyaW5nXCIsXG4gICAgICAgICAgZW1wdHk6IGZhbHNlXG4gICAgICAgIH0sXG4gICAgICAgIG1lc3NhZ2U6IHtcbiAgICAgICAgICBkZXNjcmlwdGlvbjogXCJFcnJvciBtZXNzYWdlLlwiLFxuICAgICAgICAgIHR5cGU6IFwic3RyaW5nXCIsXG4gICAgICAgICAgZW1wdHk6IGZhbHNlXG4gICAgICAgIH0sXG4gICAgICAgIGRldGFpbDoge1xuICAgICAgICAgIGRlc2NyaXB0aW9uOiBcIkVycm9yIGRldGFpbC5cIixcbiAgICAgICAgICB0eXBlOiBcInN0cmluZ1wiLFxuICAgICAgICAgIG9wdGlvbmFsOiB0cnVlLFxuICAgICAgICAgIGVtcHR5OiBmYWxzZVxuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgb3B0aW9uYWw6IHRydWVcbiAgICB9XG4gIH1cbn07XG5jb25zdCBUQVNLU19UUkFERVJfU1RBUlRfRVZFTlQgPSB7XG4gIGV2ZW50VHlwZTogXCJDUFouVGFza3MuVHJhZGVyLlN0YXJ0XCIsXG5cbiAgZGF0YVNjaGVtYToge1xuICAgIHRhc2tJZDoge1xuICAgICAgZGVzY3JpcHRpb246IFwiVW5pcSB0YXNrIGlkLlwiLFxuICAgICAgdHlwZTogXCJzdHJpbmdcIixcbiAgICAgIGVtcHR5OiBmYWxzZVxuICAgIH0sXG4gICAgbW9kZToge1xuICAgICAgZGVzY3JpcHRpb246IFwiU2VydmljZSBydW4gbW9kZS5cIixcbiAgICAgIHR5cGU6IFwic3RyaW5nXCIsXG4gICAgICB2YWx1ZXM6IFtcImJhY2t0ZXN0XCIsIFwiZW11bGF0b3JcIiwgXCJyZWFsdGltZVwiXVxuICAgIH0sXG4gICAgZGVidWc6IHtcbiAgICAgIGRlc2NyaXB0aW9uOiBcIkRlYnVnIG1vZGUuXCIsXG4gICAgICB0eXBlOiBcImJvb2xlYW5cIlxuICAgIH0sXG4gICAgZXhjaGFuZ2U6IHsgZGVzY3JpcHRpb246IFwiRXhjaGFuZ2UgY29kZS5cIiwgdHlwZTogXCJzdHJpbmdcIiwgZW1wdHk6IGZhbHNlIH0sXG4gICAgYXNzZXQ6IHsgZGVzY3JpcHRpb246IFwiQmFzZSBjdXJyZW5jeS5cIiwgdHlwZTogXCJzdHJpbmdcIiwgZW1wdHk6IGZhbHNlIH0sXG4gICAgY3VycmVuY3k6IHsgZGVzY3JpcHRpb246IFwiUXVvdGUgY3VycmVuY3kuXCIsIHR5cGU6IFwic3RyaW5nXCIsIGVtcHR5OiBmYWxzZSB9LFxuICAgIHRpbWVmcmFtZToge1xuICAgICAgZGVzY3JpcHRpb246IFwiVGltZWZyYW1lIGluIG1pbnV0ZXMuXCIsXG4gICAgICB0eXBlOiBcIm51bWJlclwiXG4gICAgfSxcbiAgICByb2JvdElkOiB7XG4gICAgICBkZXNjcmlwdGlvbjogXCJSb2JvdCB1bmlxIElkLiAtICdBZHZpc29yTmFtZSdcIixcbiAgICAgIHR5cGU6IFwic3RyaW5nXCIsXG4gICAgICBlbXB0eTogZmFsc2VcbiAgICB9LFxuICAgIHVzZXJJZDoge1xuICAgICAgZGVzY3JpcHRpb246IFwiVXNlciB1bmlxIElkLlwiLFxuICAgICAgdHlwZTogXCJzdHJpbmdcIixcbiAgICAgIGVtcHR5OiBmYWxzZVxuICAgIH0sXG4gICAgc2V0dGluZ3M6IHtcbiAgICAgIGRlc2NyaXB0aW9uOiBcIlRyYWRlciBwYXJhbWV0ZXJzLlwiLFxuICAgICAgdHlwZTogXCJvYmplY3RcIixcbiAgICAgIHByb3BzOiB7XG4gICAgICAgIHNsaXBwYWdlU3RlcDoge1xuICAgICAgICAgIGRlc2NyaXB0aW9uOiBcIlByaWNlIFNsaXBwYWdlIFN0ZXAuXCIsXG4gICAgICAgICAgdHlwZTogXCJudW1iZXJcIlxuICAgICAgICB9LFxuICAgICAgICB2b2x1bWU6IHtcbiAgICAgICAgICBkZXNjcmlwdGlvbjogXCJVc2VyIHRyYWRlIHZvbHVtZVwiLFxuICAgICAgICAgIHR5cGU6IFwibnVtYmVyXCJcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIG9wdGlvbmFsOiB0cnVlXG4gICAgfVxuICB9XG59O1xuY29uc3QgVEFTS1NfVFJBREVSX1NUT1BfRVZFTlQgPSB7XG4gIGV2ZW50VHlwZTogXCJDUFouVGFza3MuVHJhZGVyLlN0b3BcIixcblxuICBkYXRhU2NoZW1hOiB7XG4gICAgdGFza0lkOiB7XG4gICAgICBkZXNjcmlwdGlvbjogXCJVbmlxIHRhc2sgaWQuXCIsXG4gICAgICB0eXBlOiBcInN0cmluZ1wiLFxuICAgICAgZW1wdHk6IGZhbHNlXG4gICAgfSxcbiAgICByb2JvdElkOiB7XG4gICAgICBkZXNjcmlwdGlvbjogXCJSb2JvdCBpZC5cIixcbiAgICAgIHR5cGU6IFwic3RyaW5nXCIsXG4gICAgICBlbXB0eTogZmFsc2VcbiAgICB9XG4gIH1cbn07XG5jb25zdCBUQVNLU19UUkFERVJfVVBEQVRFX0VWRU5UID0ge1xuICBldmVudFR5cGU6IFwiQ1BaLlRhc2tzLlRyYWRlci5VcGRhdGVcIixcblxuICBkYXRhU2NoZW1hOiB7XG4gICAgdGFza0lkOiB7XG4gICAgICBkZXNjcmlwdGlvbjogXCJVbmlxIHRhc2sgaWQuXCIsXG4gICAgICB0eXBlOiBcInN0cmluZ1wiLFxuICAgICAgZW1wdHk6IGZhbHNlXG4gICAgfSxcbiAgICBkZWJ1Zzoge1xuICAgICAgZGVzY3JpcHRpb246IFwiRGVidWcgbW9kZS5cIixcbiAgICAgIHR5cGU6IFwiYm9vbGVhblwiXG4gICAgfSxcbiAgICBzZXR0aW5nczoge1xuICAgICAgZGVzY3JpcHRpb246IFwiVHJhZGVyIHBhcmFtZXRlcnMuXCIsXG4gICAgICB0eXBlOiBcIm9iamVjdFwiLFxuICAgICAgcHJvcHM6IHtcbiAgICAgICAgc2xpcHBhZ2VTdGVwOiB7XG4gICAgICAgICAgZGVzY3JpcHRpb246IFwiUHJpY2UgU2xpcHBhZ2UgU3RlcC5cIixcbiAgICAgICAgICB0eXBlOiBcIm51bWJlclwiXG4gICAgICAgIH0sXG4gICAgICAgIHZvbHVtZToge1xuICAgICAgICAgIGRlc2NyaXB0aW9uOiBcIlVzZXIgdHJhZGUgdm9sdW1lXCIsXG4gICAgICAgICAgdHlwZTogXCJudW1iZXJcIlxuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgb3B0aW9uYWw6IHRydWVcbiAgICB9XG4gIH1cbn07XG5jb25zdCBUQVNLU19UUkFERVJfU1RBUlRFRF9FVkVOVCA9IHtcbiAgZXZlbnRUeXBlOiBcIkNQWi5UYXNrcy5UcmFkZXIuU3RhcnRlZFwiLFxuXG4gIGRhdGFTY2hlbWE6IHtcbiAgICB0YXNrSWQ6IHtcbiAgICAgIGRlc2NyaXB0aW9uOiBcIlVuaXEgdGFzayBpZC5cIixcbiAgICAgIHR5cGU6IFwic3RyaW5nXCIsXG4gICAgICBlbXB0eTogZmFsc2VcbiAgICB9LFxuICAgIHJvd0tleToge1xuICAgICAgZGVzY3JpcHRpb246IFwiVGFibGUgc3RvcmFnZSB1bmlxIHJvdyBrZXkuXCIsXG4gICAgICB0eXBlOiBcInN0cmluZ1wiLFxuICAgICAgZW1wdHk6IGZhbHNlXG4gICAgfSxcbiAgICBwYXJ0aXRpb25LZXk6IHtcbiAgICAgIGRlc2NyaXB0aW9uOiBcIlRhYmxlIHN0b3JhZ2UgcGFydGl0aW9uIGtleS5cIixcbiAgICAgIHR5cGU6IFwic3RyaW5nXCIsXG4gICAgICBlbXB0eTogZmFsc2VcbiAgICB9LFxuICAgIGVycm9yOiB7XG4gICAgICB0eXBlOiBcIm9iamVjdFwiLFxuICAgICAgZGVzY3JpcHRpb246IFwiRXJyb3Igb2JqZWN0IGlmIHNvbWV0aGluZyBnb2VzIHdyb25nLlwiLFxuICAgICAgcHJvcHM6IHtcbiAgICAgICAgY29kZToge1xuICAgICAgICAgIGRlc2NyaXB0aW9uOiBcIkVycm9yIGNvZGUuXCIsXG4gICAgICAgICAgdHlwZTogXCJzdHJpbmdcIixcbiAgICAgICAgICBlbXB0eTogZmFsc2VcbiAgICAgICAgfSxcbiAgICAgICAgbWVzc2FnZToge1xuICAgICAgICAgIGRlc2NyaXB0aW9uOiBcIkVycm9yIG1lc3NhZ2UuXCIsXG4gICAgICAgICAgdHlwZTogXCJzdHJpbmdcIixcbiAgICAgICAgICBlbXB0eTogZmFsc2VcbiAgICAgICAgfSxcbiAgICAgICAgZGV0YWlsOiB7XG4gICAgICAgICAgZGVzY3JpcHRpb246IFwiRXJyb3IgZGV0YWlsLlwiLFxuICAgICAgICAgIHR5cGU6IFwic3RyaW5nXCIsXG4gICAgICAgICAgb3B0aW9uYWw6IHRydWUsXG4gICAgICAgICAgZW1wdHk6IGZhbHNlXG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBvcHRpb25hbDogdHJ1ZVxuICAgIH1cbiAgfVxufTtcbmNvbnN0IFRBU0tTX1RSQURFUl9TVE9QUEVEX0VWRU5UID0ge1xuICBldmVudFR5cGU6IFwiQ1BaLlRhc2tzLlRyYWRlci5TdG9wcGVkXCIsXG5cbiAgZGF0YVNjaGVtYToge1xuICAgIHRhc2tJZDoge1xuICAgICAgZGVzY3JpcHRpb246IFwiVW5pcSB0YXNrIGlkLlwiLFxuICAgICAgdHlwZTogXCJzdHJpbmdcIixcbiAgICAgIGVtcHR5OiBmYWxzZVxuICAgIH0sXG4gICAgZXJyb3I6IHtcbiAgICAgIHR5cGU6IFwib2JqZWN0XCIsXG4gICAgICBkZXNjcmlwdGlvbjogXCJFcnJvciBvYmplY3QgaWYgc29tZXRoaW5nIGdvZXMgd3JvbmcuXCIsXG4gICAgICBwcm9wczoge1xuICAgICAgICBjb2RlOiB7XG4gICAgICAgICAgZGVzY3JpcHRpb246IFwiRXJyb3IgY29kZS5cIixcbiAgICAgICAgICB0eXBlOiBcInN0cmluZ1wiLFxuICAgICAgICAgIGVtcHR5OiBmYWxzZVxuICAgICAgICB9LFxuICAgICAgICBtZXNzYWdlOiB7XG4gICAgICAgICAgZGVzY3JpcHRpb246IFwiRXJyb3IgbWVzc2FnZS5cIixcbiAgICAgICAgICB0eXBlOiBcInN0cmluZ1wiLFxuICAgICAgICAgIGVtcHR5OiBmYWxzZVxuICAgICAgICB9LFxuICAgICAgICBkZXRhaWw6IHtcbiAgICAgICAgICBkZXNjcmlwdGlvbjogXCJFcnJvciBkZXRhaWwuXCIsXG4gICAgICAgICAgdHlwZTogXCJzdHJpbmdcIixcbiAgICAgICAgICBvcHRpb25hbDogdHJ1ZSxcbiAgICAgICAgICBlbXB0eTogZmFsc2VcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIG9wdGlvbmFsOiB0cnVlXG4gICAgfVxuICB9XG59O1xuY29uc3QgVEFTS1NfVFJBREVSX1VQREFURURfRVZFTlQgPSB7XG4gIGV2ZW50VHlwZTogXCJDUFouVGFza3MuVHJhZGVyLlVwZGF0ZWRcIixcblxuICBkYXRhU2NoZW1hOiB7XG4gICAgdGFza0lkOiB7XG4gICAgICBkZXNjcmlwdGlvbjogXCJVbmlxIHRhc2sgaWQuXCIsXG4gICAgICB0eXBlOiBcInN0cmluZ1wiLFxuICAgICAgZW1wdHk6IGZhbHNlXG4gICAgfSxcbiAgICBlcnJvcjoge1xuICAgICAgdHlwZTogXCJvYmplY3RcIixcbiAgICAgIGRlc2NyaXB0aW9uOiBcIkVycm9yIG9iamVjdCBpZiBzb21ldGhpbmcgZ29lcyB3cm9uZy5cIixcbiAgICAgIHByb3BzOiB7XG4gICAgICAgIGNvZGU6IHtcbiAgICAgICAgICBkZXNjcmlwdGlvbjogXCJFcnJvciBjb2RlLlwiLFxuICAgICAgICAgIHR5cGU6IFwic3RyaW5nXCIsXG4gICAgICAgICAgZW1wdHk6IGZhbHNlXG4gICAgICAgIH0sXG4gICAgICAgIG1lc3NhZ2U6IHtcbiAgICAgICAgICBkZXNjcmlwdGlvbjogXCJFcnJvciBtZXNzYWdlLlwiLFxuICAgICAgICAgIHR5cGU6IFwic3RyaW5nXCIsXG4gICAgICAgICAgZW1wdHk6IGZhbHNlXG4gICAgICAgIH0sXG4gICAgICAgIGRldGFpbDoge1xuICAgICAgICAgIGRlc2NyaXB0aW9uOiBcIkVycm9yIGRldGFpbC5cIixcbiAgICAgICAgICB0eXBlOiBcInN0cmluZ1wiLFxuICAgICAgICAgIG9wdGlvbmFsOiB0cnVlLFxuICAgICAgICAgIGVtcHR5OiBmYWxzZVxuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgb3B0aW9uYWw6IHRydWVcbiAgICB9XG4gIH1cbn07XG5cbmV4cG9ydCB7XG4gIFRBU0tTX01BUktFVFdBVENIRVJfU1RBUlRfRVZFTlQsXG4gIFRBU0tTX01BUktFVFdBVENIRVJfU1RBUlRFRF9FVkVOVCxcbiAgVEFTS1NfTUFSS0VUV0FUQ0hFUl9TVE9QX0VWRU5ULFxuICBUQVNLU19NQVJLRVRXQVRDSEVSX1NUT1BQRURfRVZFTlQsXG4gIFRBU0tTX01BUktFVFdBVENIRVJfU1VCU0NSSUJFX0VWRU5ULFxuICBUQVNLU19NQVJLRVRXQVRDSEVSX1NVQlNDUklCRURfRVZFTlQsXG4gIFRBU0tTX01BUktFVFdBVENIRVJfVU5TVUJTQ1JJQkVfRVZFTlQsXG4gIFRBU0tTX01BUktFVFdBVENIRVJfVU5TVUJTQ1JJQkVEX0VWRU5ULFxuICBUQVNLU19DQU5ETEVCQVRDSEVSX1NUQVJUX0VWRU5ULFxuICBUQVNLU19DQU5ETEVCQVRDSEVSX1NUQVJURURfRVZFTlQsXG4gIFRBU0tTX0NBTkRMRUJBVENIRVJfU1RPUF9FVkVOVCxcbiAgVEFTS1NfQ0FORExFQkFUQ0hFUl9TVE9QUEVEX0VWRU5ULFxuICBUQVNLU19DQU5ETEVCQVRDSEVSX1VQREFURV9FVkVOVCxcbiAgVEFTS1NfQ0FORExFQkFUQ0hFUl9VUERBVEVEX0VWRU5ULFxuICBUQVNLU19BRFZJU0VSX1NUQVJUX0VWRU5ULFxuICBUQVNLU19BRFZJU0VSX1NUQVJURURfRVZFTlQsXG4gIFRBU0tTX0FEVklTRVJfU1RPUF9FVkVOVCxcbiAgVEFTS1NfQURWSVNFUl9TVE9QUEVEX0VWRU5ULFxuICBUQVNLU19BRFZJU0VSX1VQREFURV9FVkVOVCxcbiAgVEFTS1NfQURWSVNFUl9VUERBVEVEX0VWRU5ULFxuICBUQVNLU19UUkFERVJfU1RBUlRfRVZFTlQsXG4gIFRBU0tTX1RSQURFUl9TVEFSVEVEX0VWRU5ULFxuICBUQVNLU19UUkFERVJfU1RPUF9FVkVOVCxcbiAgVEFTS1NfVFJBREVSX1NUT1BQRURfRVZFTlQsXG4gIFRBU0tTX1RSQURFUl9VUERBVEVfRVZFTlQsXG4gIFRBU0tTX1RSQURFUl9VUERBVEVEX0VWRU5UXG59O1xuIiwiY29uc3QgVElDS1NfTkVXVElDS19FVkVOVCA9IHtcbiAgZXZlbnRUeXBlOiBcIkNQWi5UaWNrcy5OZXdUaWNrXCIsXG5cbiAgZGF0YVNjaGVtYToge1xuICAgIGV4Y2hhbmdlOiB7IGRlc2NyaXB0aW9uOiBcIkV4Y2hhbmdlIGNvZGUuXCIsIHR5cGU6IFwic3RyaW5nXCIsIGVtcHR5OiBmYWxzZSB9LFxuICAgIGFzc2V0OiB7IGRlc2NyaXB0aW9uOiBcIkJhc2UgY3VycmVuY3kuXCIsIHR5cGU6IFwic3RyaW5nXCIsIGVtcHR5OiBmYWxzZSB9LFxuICAgIGN1cnJlbmN5OiB7IGRlc2NyaXB0aW9uOiBcIlF1b3RlIGN1cnJlbmN5LlwiLCB0eXBlOiBcInN0cmluZ1wiLCBlbXB0eTogZmFsc2UgfSxcbiAgICBzaWRlOiB7XG4gICAgICBkZXNjcmlwdGlvbjogXCJUcmFkZSBzaWRlLlwiLFxuICAgICAgdHlwZTogXCJzdHJpbmdcIixcbiAgICAgIHZhbHVlczogW1wiYnV5XCIsIFwic2VsbFwiXVxuICAgIH0sXG4gICAgdHJhZGVJZDoge1xuICAgICAgZGVzY3JpcHRpb246IFwiVHJhZGUgSUQuXCIsXG4gICAgICB0eXBlOiBcInN0cmluZ1wiLFxuICAgICAgZW1wdHk6IGZhbHNlXG4gICAgfSxcbiAgICB0aW1lOiB7IGRlc2NyaXB0aW9uOiBcIlRyYWRlIHRpbWUgaW4gc2Vjb25kcy5cIiwgdHlwZTogXCJudW1iZXJcIiB9LFxuICAgIHZvbHVtZTogeyBkZXNjcmlwdGlvbjogXCJUcmFkZSBWb2x1bWUuXCIsIHR5cGU6IFwibnVtYmVyXCIgfSxcbiAgICBwcmljZTogeyBkZXNjcmlwdGlvbjogXCJUcmFkZSBQcmljZS5cIiwgdHlwZTogXCJudW1iZXJcIiB9XG4gIH1cbn07XG5cbmNvbnN0IFRJQ0tTX0hBTkRMRURfRVZFTlQgPSB7XG4gIGV2ZW50VHlwZTogXCJDUFouVGlja3MuSGFuZGxlZFwiLFxuXG4gIGRhdGFTY2hlbWE6IHtcbiAgICB0cmFkZUlkOiB7IGRlc2NyaXB0aW9uOiBcIlVuaXEgVHJhZGUgSWQuXCIsIHR5cGU6IFwic3RyaW5nXCIsIGVtcHR5OiBmYWxzZSB9LFxuICAgIHNlcnZpY2U6IHtcbiAgICAgIGRlc2NyaXB0aW9uOiBcIlNldmljZSBuYW1lIGhhbmRlbGluZyBldmVudFwiLFxuICAgICAgdHlwZTogXCJzdHJpbmdcIixcbiAgICAgIHZhbHVlczogW1widHJhZGVyXCJdXG4gICAgfSxcbiAgICBzdWNjZXNzOiB7XG4gICAgICBkZXNjcmlwdGlvbjogXCJTdWNjZXNzIGV4ZWN1dGlvbiBsaXN0XCIsXG4gICAgICB0eXBlOiBcImFycmF5XCIsXG4gICAgICBpdGVtczogXCJzdHJpbmdcIlxuICAgIH0sXG4gICAgZXJyb3I6IHtcbiAgICAgIGRlc2NyaXB0aW9uOiBcIkVycm9yIGV4ZWN1dGlvbiBsaXN0XCIsXG4gICAgICB0eXBlOiBcImFycmF5XCIsXG4gICAgICBpdGVtczoge1xuICAgICAgICB0eXBlOiBcIm9iamVjdFwiLFxuICAgICAgICBwcm9wczoge1xuICAgICAgICAgIHRhc2tJZDogeyB0eXBlOiBcInN0cmluZ1wiLCBlbXB0eTogZmFsc2UgfSxcbiAgICAgICAgICBlcnJvcjoge1xuICAgICAgICAgICAgdHlwZTogXCJvYmplY3RcIixcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBcIkVycm9yIG9iamVjdCBpZiBzb21ldGhpbmcgZ29lcyB3cm9uZy5cIixcbiAgICAgICAgICAgIHByb3BzOiB7XG4gICAgICAgICAgICAgIGNvZGU6IHtcbiAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogXCJFcnJvciBjb2RlLlwiLFxuICAgICAgICAgICAgICAgIHR5cGU6IFwic3RyaW5nXCIsXG4gICAgICAgICAgICAgICAgZW1wdHk6IGZhbHNlXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIG1lc3NhZ2U6IHtcbiAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogXCJFcnJvciBtZXNzYWdlLlwiLFxuICAgICAgICAgICAgICAgIHR5cGU6IFwic3RyaW5nXCIsXG4gICAgICAgICAgICAgICAgZW1wdHk6IGZhbHNlXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIGRldGFpbDoge1xuICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBcIkVycm9yIGRldGFpbC5cIixcbiAgICAgICAgICAgICAgICB0eXBlOiBcInN0cmluZ1wiLFxuICAgICAgICAgICAgICAgIG9wdGlvbmFsOiB0cnVlLFxuICAgICAgICAgICAgICAgIGVtcHR5OiBmYWxzZVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgb3B0aW9uYWw6IHRydWVcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cbn07XG5leHBvcnQgeyBUSUNLU19ORVdUSUNLX0VWRU5ULCBUSUNLU19IQU5ETEVEX0VWRU5UIH07XG4iLCJjb25zdCBBRFZJU0VSX1NFUlZJQ0UgPSBcImFkdmlzZXJcIjtcblxuZXhwb3J0IHsgQURWSVNFUl9TRVJWSUNFIH07XG4iLCJleHBvcnQgKiBmcm9tIFwiLi9pbmRpY2F0b3JzXCI7XG5leHBvcnQgKiBmcm9tIFwiLi9zdGF0dXNcIjtcbiIsImNvbnN0IElORElDQVRPUlNfQkFTRSA9IFwiYmFzZVwiO1xuY29uc3QgSU5ESUNBVE9SU19UVUxJUCA9IFwidHVsaXBcIjtcblxuZXhwb3J0IHsgSU5ESUNBVE9SU19CQVNFLCBJTkRJQ0FUT1JTX1RVTElQIH07XG4iLCJjb25zdCBTVEFUVVNfU1RBUlRFRCA9IFwic3RhcnRlZFwiO1xuY29uc3QgU1RBVFVTX1BFTkRJTkcgPSBcInBlbmRpbmdcIjtcbmNvbnN0IFNUQVRVU19CVVNZID0gXCJidXN5XCI7XG5jb25zdCBTVEFUVVNfU1RPUFBFRCA9IFwic3RvcHBlZFwiO1xuY29uc3QgU1RBVFVTX0VSUk9SID0gXCJlcnJvclwiO1xuY29uc3QgU1RBVFVTX0ZJTklTSEVEID0gXCJmaW5pc2hlZFwiO1xuXG5leHBvcnQge1xuICBTVEFUVVNfQlVTWSxcbiAgU1RBVFVTX0VSUk9SLFxuICBTVEFUVVNfRklOSVNIRUQsXG4gIFNUQVRVU19QRU5ESU5HLFxuICBTVEFUVVNfU1RBUlRFRCxcbiAgU1RBVFVTX1NUT1BQRURcbn07XG4iLCJjb25zdCBTVE9SQUdFX0FEVklTRVJTX1RBQkxFID0gXCJBZHZpc2Vyc1wiO1xuY29uc3QgU1RPUkFHRV9DQU5ETEVTQ0FDSEVEX1RBQkxFID0gXCJDYW5kbGVzQ2FjaGVkXCI7XG5jb25zdCBTVE9SQUdFX0NBTkRMRVNQRU5ESU5HX1RBQkxFID0gXCJDYW5kbGVzUGVuZGluZ1wiO1xuXG5leHBvcnQge1xuICBTVE9SQUdFX0FEVklTRVJTX1RBQkxFLFxuICBTVE9SQUdFX0NBTkRMRVNDQUNIRURfVEFCTEUsXG4gIFNUT1JBR0VfQ0FORExFU1BFTkRJTkdfVEFCTEVcbn07XG4iLCJpbXBvcnQgeyB2NCBhcyB1dWlkIH0gZnJvbSBcInV1aWRcIjtcbmltcG9ydCBkYXlqcyBmcm9tIFwiZGF5anNcIjtcbmltcG9ydCB7IFNJR05BTFNfTkVXU0lHTkFMX0VWRU5ULCBMT0dfQURWSVNFUl9FVkVOVCB9IGZyb20gXCJjcHpFdmVudFR5cGVzXCI7XG5pbXBvcnQge1xuICBTVEFUVVNfU1RBUlRFRCxcbiAgU1RBVFVTX1NUT1BQRUQsXG4gIElORElDQVRPUlNfQkFTRSxcbiAgSU5ESUNBVE9SU19UVUxJUFxufSBmcm9tIFwiY3B6U3RhdGVcIjtcbmltcG9ydCB7IFJFUVVJUkVEX0hJU1RPUllfTUFYX0JBUlMgfSBmcm9tIFwiY3B6RGVmYXVsdHNcIjtcbmltcG9ydCBCYXNlU3RyYXRlZ3kgZnJvbSBcIi4vYmFzZVN0cmF0ZWd5XCI7XG5pbXBvcnQgQmFzZUluZGljYXRvciBmcm9tIFwiLi9iYXNlSW5kaWNhdG9yXCI7XG5pbXBvcnQgVHVsaXBJbmRpY2F0b3JDbGFzcyBmcm9tIFwiLi4vbGliL3R1bGlwL3R1bGlwSW5kaWNhdG9yc1wiO1xuaW1wb3J0IHsgZ2V0Q2FjaGVkQ2FuZGxlc0J5S2V5LCBzYXZlQWR2aXNlclN0YXRlIH0gZnJvbSBcIi4uL3RhYmxlU3RvcmFnZVwiO1xuaW1wb3J0IHsgcHVibGlzaEV2ZW50cywgY3JlYXRlRXZlbnRzIH0gZnJvbSBcIi4uL2V2ZW50Z3JpZFwiO1xuXG4vKipcbiAqINCa0LvQsNGB0YEg0YHQvtCy0LXRgtC90LjQutCwXG4gKlxuICogQGNsYXNzIEFkdmlzZXJcbiAqL1xuY2xhc3MgQWR2aXNlciB7XG4gIC8qKlxuICAgKtCa0L7QvdGB0YLRgNGD0LrRgtC+0YBcbiAgICogQHBhcmFtIHtPYmplY3R9IGNvbnRleHRcbiAgICogQHBhcmFtIHtPYmplY3R9IHN0YXRlXG4gICAqL1xuICBjb25zdHJ1Y3Rvcihjb250ZXh0LCBzdGF0ZSkge1xuICAgIHRoaXMuX2NvbnRleHQgPSBjb250ZXh0OyAvLyDRgtC10LrRg9GJ0LjQuSDQutC+0L3RgtC10LrRgdGCINCy0YvQv9C+0LvQvdC10L3QuNGPXG4gICAgdGhpcy5fZXZlbnRTdWJqZWN0ID0gc3RhdGUuZXZlbnRTdWJqZWN0OyAvLyDRgtC10LzQsCDRgdC+0LHRi9GC0LjRj1xuICAgIHRoaXMuX3Rhc2tJZCA9IHN0YXRlLnRhc2tJZDsgLy8g0YPQvdC40LrQsNC70YzQvdGL0Lkg0LjQtNC10L3RgtC40YTQuNC60LDRgtC+0YAg0LfQsNC00LDRh9C4XG4gICAgdGhpcy5fcm9ib3RJZCA9IHN0YXRlLnJvYm90SWQ7IC8vINC40LTQtdC90YLQuNGE0LjQutCw0YLQvtGAINGA0L7QsdC+0YLQsFxuICAgIHRoaXMuX21vZGUgPSBzdGF0ZS5tb2RlOyAvLyDRgNC10LbQuNC8INGA0LDQsdC+0YLRiyBbJ2JhY2t0ZXN0JywgJ2VtdWxhdG9yJywgJ3JlYWx0aW1lJ11cbiAgICB0aGlzLl9kZWJ1ZyA9IHN0YXRlLmRlYnVnOyAvLyDRgNC10LbQuNC80LAg0LTQtdCx0LDQs9CwIFt0cnVlLGZhbHNlXVxuICAgIHRoaXMuX3NldHRpbmdzID0gc3RhdGUuc2V0dGluZ3MgfHwge307IC8vINC+0LHRitC10LrRgiDQvdCw0YHRgtGA0L7QtdC6INC40Lcg0LLQtdCxLdC40L3RgtC10YDRhNC10LnRgdCwXG4gICAgdGhpcy5fZXhjaGFuZ2UgPSBzdGF0ZS5leGNoYW5nZTsgLy8g0LrQvtC0INCx0LjRgNC20LhcbiAgICB0aGlzLl9hc3NldCA9IHN0YXRlLmFzc2V0OyAvLyDQsdCw0LfQvtCy0LDRjyDQstCw0LvRjtGC0LBcbiAgICB0aGlzLl9jdXJyZW5jeSA9IHN0YXRlLmN1cnJlbmN5OyAvLyDQutC+0YLQuNGA0L7QstC60LAg0LLQsNC70Y7RgtGLXG4gICAgdGhpcy5fdGltZWZyYW1lID0gc3RhdGUudGltZWZyYW1lOyAvLyDRgtCw0LnQvNGE0YDQtdC50LxcbiAgICB0aGlzLl9zdHJhdGVneU5hbWUgPSBzdGF0ZS5zdHJhdGVneU5hbWU7IC8vINC40LzRjyDRhNCw0LnQu9CwINGB0YLRgNCw0YLQtdCz0LjQuFxuICAgIHRoaXMuX3JlcXVpcmVkSGlzdG9yeUNhY2hlID0gc3RhdGUucmVxdWlyZWRIaXN0b3J5Q2FjaGUgfHwgdHJ1ZTsgLy8g0LfQsNCz0YDRg9C20LDRgtGMINC40YHRgtC+0YDQuNGOINC40Lcg0LrRjdGI0LBcbiAgICB0aGlzLl9yZXF1aXJlZEhpc3RvcnlNYXhCYXJzID1cbiAgICAgIHN0YXRlLnJlcXVpcmVkSGlzdG9yeU1heEJhcnMgfHwgUkVRVUlSRURfSElTVE9SWV9NQVhfQkFSUzsgLy8g0LzQsNC60YHQuNC80LDQu9GM0L3QviDQutC+0LvQuNGH0LXRgdGC0LLQviDRgdCy0LXRh9C10Lkg0LIg0LrRjdGI0LVcbiAgICB0aGlzLl9zdHJhdGVneSA9IHN0YXRlLnN0cmF0ZWd5IHx8IHsgdmFyaWFibGVzOiB7fSB9OyAvLyDRgdC+0YHRgtC+0Y/QvdC1INGB0YLRgNCw0YLQtdCz0LjQuFxuICAgIHRoaXMuX2luZGljYXRvcnMgPSBzdGF0ZS5pbmRpY2F0b3JzIHx8IHt9OyAvLyDRgdC+0YHRgtC+0Y/QvdC40LUg0LjQvdC00LjQutCw0YLQvtGA0L7QslxuICAgIHRoaXMuX2NhbmRsZSA9IHt9OyAvLyDRgtC10LrRg9GJ0LDRjyDRgdCy0LXRh9CwXG4gICAgdGhpcy5fbGFzdENhbmRsZSA9IHN0YXRlLmxhc3RDYW5kbGUgfHwge307IC8vINC/0L7RgdC70LXQtNC90Y/RjyDRgdCy0LXRh9CwXG4gICAgdGhpcy5faW5kaWNhdG9ycyA9IHN0YXRlLmluZGljYXRvcnMgfHwge307IC8vINC40L3QtNC40LrQsNGC0L7RgNGLXG4gICAgdGhpcy5fc2lnbmFscyA9IFtdOyAvLyDQvNCw0YHRgdC40LIg0YHQuNCz0L3QsNC70L7QsiDQuiDQvtGC0L/RgNCw0LLQutC1XG4gICAgdGhpcy5fbGFzdFNpZ25hbHMgPSBzdGF0ZS5sYXN0U2lnbmFscyB8fCBbXTsgLy8g0LzQsNGB0YHQuNCyINC/0L7RgdC70LXQtNC90LjRhSDRgdC40LPQvdCw0LvQvtCyXG4gICAgdGhpcy5fdXBkYXRlUmVxdWVzdGVkID0gc3RhdGUudXBkYXRlUmVxdWVzdGVkIHx8IGZhbHNlOyAvLyDQvtCx0YrQtdC60YIg0LfQsNC/0YDQvtGB0LAg0L3QsCDQvtCx0L3QvtCy0LvQtdC90LjQtSDQv9Cw0YDQsNC80LXRgtGA0L7QsiB7ZGVidWcscHJveHksdGltZWZyYW1lcyxldmVudFN1YmplY3R9INC40LvQuCBmYWxzZVxuICAgIHRoaXMuX3N0b3BSZXF1ZXN0ZWQgPSBzdGF0ZS5zdG9wUmVxdWVzdGVkIHx8IGZhbHNlOyAvLyDQv9GA0LjQt9C90LDQuiDQt9Cw0L/RgNC+0YHQsCDQvdCwINC+0YHRgtCw0L3QvtCy0LrRgyDRgdC10YDQstC40YHQsCBbdHJ1ZSxmYWxzZV1cbiAgICB0aGlzLl9zdGF0dXMgPSB0aGlzLl9zdG9wUmVxdWVzdGVkXG4gICAgICA/IFNUQVRVU19TVE9QUEVEXG4gICAgICA6IHN0YXRlLnN0YXR1cyB8fCBTVEFUVVNfU1RBUlRFRDsgLy8g0YLQtdC60YPRidC40Lkg0YHRgtCw0YLRg9GBINGB0LXRgNCy0LjRgdCwXG4gICAgdGhpcy5fc3RhcnRlZEF0ID0gc3RhdGUuc3RhcnRlZEF0IHx8IGRheWpzKCkudG9KU09OKCk7IC8vICDQlNCw0YLQsCDQuCDQstGA0LXQvNGPINC30LDQv9GD0YHQutCwXG4gICAgdGhpcy5fZW5kZWRBdCA9XG4gICAgICBzdGF0ZS5lbmRlZEF0IHx8IHRoaXMuX3N0YXR1cyA9PT0gU1RBVFVTX1NUT1BQRUQgPyBkYXlqcygpLnRvSlNPTigpIDogXCJcIjsgLy8g0JTQsNGC0LAg0Lgg0LLRgNC10LzRjyDQvtGB0YLQsNC90L7QstC60LhcbiAgICB0aGlzLl9pbml0aWFsaXplZCA9IHN0YXRlLmluaXRpYWxpemVkIHx8IGZhbHNlO1xuICAgIHRoaXMubG9hZFN0cmF0ZWd5KCk7XG4gICAgdGhpcy5sb2FkSW5kaWNhdG9ycygpO1xuICAgIGlmICghdGhpcy5faW5pdGlhbGl6ZWQpIHtcbiAgICAgIHRoaXMuaW5pdFN0cmF0ZWd5KCk7XG5cbiAgICAgIHRoaXMuX2luaXRpYWxpemVkID0gdHJ1ZTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICog0JfQsNCz0YDRg9C30LrQsCDRgdGC0YDQsNGC0LXQs9C40LhcbiAgICpcbiAgICogQG1lbWJlcm9mIEFkdmlzZXJcbiAgICovXG4gIGxvYWRTdHJhdGVneSgpIHtcbiAgICB0cnkge1xuICAgICAgLy8g0KHRh9C40YLRi9Cy0LDQtdC8INGB0YLRgNCw0YLQtdCz0LjRjlxuICAgICAgLyogZXNsaW50LWRpc2FibGUgaW1wb3J0L25vLWR5bmFtaWMtcmVxdWlyZSwgZ2xvYmFsLXJlcXVpcmUgKi9cbiAgICAgIGNvbnN0IHN0cmF0ZWd5T2JqZWN0ID0gcmVxdWlyZShgLi4vc3RyYXRlZ2llcy8ke3RoaXMuX3N0cmF0ZWd5TmFtZX1gKTtcbiAgICAgIC8qIGltcG9ydC9uby1keW5hbWljLXJlcXVpcmUsIGdsb2JhbC1yZXF1aXJlICovXG4gICAgICB0aGlzLl9jb250ZXh0LmxvZyhKU09OLnN0cmluZ2lmeShzdHJhdGVneU9iamVjdCkpO1xuICAgICAgY29uc3Qgc3RyYXRlZ3lGdW5jdGlvbnMgPSB7fTtcbiAgICAgIE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKHN0cmF0ZWd5T2JqZWN0KVxuICAgICAgICAuZmlsdGVyKGtleSA9PiB0eXBlb2Ygc3RyYXRlZ3lPYmplY3Rba2V5XSA9PT0gXCJmdW5jdGlvblwiKVxuICAgICAgICAuZm9yRWFjaChrZXkgPT4ge1xuICAgICAgICAgIHN0cmF0ZWd5RnVuY3Rpb25zW2tleV0gPSBzdHJhdGVneU9iamVjdFtrZXldO1xuICAgICAgICB9KTtcbiAgICAgIHRoaXMuX2NvbnRleHQubG9nKHN0cmF0ZWd5RnVuY3Rpb25zKTtcbiAgICAgIC8vINCh0L7Qt9C00LDQtdC8INC90L7QstGL0Lkg0LjQvdGB0YLQsNC90YEg0LrQu9Cw0YHRgdCwINGB0YLRgNCw0YLQtdCz0LjQuFxuICAgICAgdGhpcy5fc3RyYXRlZ3lJbnN0YW5jZSA9IG5ldyBCYXNlU3RyYXRlZ3koe1xuICAgICAgICBjb250ZXh0OiB0aGlzLl9jb250ZXh0LFxuICAgICAgICBpbml0aWFsaXplZDogdGhpcy5fc3RyYXRlZ3kuX2luaXRpYWxpemVkLFxuICAgICAgICBzZXR0aW5nczogdGhpcy5fc2V0dGluZ3MsXG4gICAgICAgIGV4Y2hhbmdlOiB0aGlzLl9leGNoYW5nZSxcbiAgICAgICAgYXNzZXQ6IHRoaXMuX2Fzc2V0LFxuICAgICAgICBjdXJyZW5jeTogdGhpcy5fY3VycmVuY3ksXG4gICAgICAgIHRpbWVmcmFtZTogdGhpcy5fdGltZWZyYW1lLFxuICAgICAgICBhZHZpY2U6IHRoaXMuYWR2aWNlLmJpbmQodGhpcyksIC8vINGE0YPQvdC60YbQuNGPIGFkdmlzZSAtPiBhZHZpc2VyLmFkdmlzZVxuICAgICAgICBsb2c6IHRoaXMubG9nLmJpbmQodGhpcyksIC8vINGE0YPQvdC60YbQuNGPIGxvZyAtPiBhZHZpc2UubG9nXG4gICAgICAgIGxvZ0V2ZW50OiB0aGlzLmxvZ0V2ZW50LmJpbmQodGhpcyksIC8vINGE0YPQvdC60YbQuNGPIGxvZ0V2ZW50IC0+IGFkdmlzZS5sb2dFdmVudFxuICAgICAgICBzdHJhdGVneUZ1bmN0aW9ucywgLy8g0YTRg9C90LrRhtC40Lgg0YHRgtGA0LDRgtC10LPQuNC4XG4gICAgICAgIC4uLnRoaXMuX3N0cmF0ZWd5IC8vINC/0YDQtdC00YvQtNGD0YnQuNC5INGB0YLQtdC50YIg0YHRgtGA0LDRgtC10LPQuNC4XG4gICAgICB9KTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBMb2FkIHN0cmF0ZWd5IFwiJHt0aGlzLl9zdHJhdGVneU5hbWV9IGVycm9yOlwiXFxuJHtlcnJvcn1gKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogINCX0LDQs9GA0YPQt9C60LAg0LjQvdC00LjQutCw0YLQvtGA0L7QslxuICAgKlxuICAgKiBAbWVtYmVyb2YgQWR2aXNlclxuICAgKi9cbiAgbG9hZEluZGljYXRvcnMoKSB7XG4gICAgdGhpcy5sb2coXCJsb2FkSW5kaWNhdG9ycygpXCIpO1xuICAgIHRyeSB7XG4gICAgICAvLyDQmNC00LXQvCDQv9C+INCy0YHQtdC8INGB0LLQvtC50YHRgtCy0LDQvCDQsiDQvtCx0YrQtdC60YLQtSDQuNC90LTQuNC60LDRgtC+0YDQvtCyXG4gICAgICBPYmplY3Qua2V5cyh0aGlzLl9pbmRpY2F0b3JzKS5mb3JFYWNoKGtleSA9PiB7XG4gICAgICAgIC8vINCh0YfQuNGC0YvQstCw0LXQvCDQuNC90LTQuNC60LDRgtC+0YAg0L/QviDQutC70Y7Rh9GDXG4gICAgICAgIGNvbnN0IGluZGljYXRvciA9IHRoaXMuX2luZGljYXRvcnNba2V5XTtcbiAgICAgICAgLy8g0JIg0LfQsNCy0LjRgdC40LzQvtGB0YLQuCDQvtGCINGC0LjQv9CwINC40L3QtNC40LrQsNGC0L7RgNCwXG4gICAgICAgIHN3aXRjaCAoaW5kaWNhdG9yLnR5cGUpIHtcbiAgICAgICAgICBjYXNlIElORElDQVRPUlNfQkFTRToge1xuICAgICAgICAgICAgLy8g0JXRgdC70Lgg0LHQsNC30L7QstGL0Lkg0LjQvdC00LjQutCw0YLQvtGAXG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAvLyDQodGH0LjRgtGL0LLQsNC10Lwg0L7QsdGK0LXQutGCINC40L3QtNC40LrQsNGC0L7RgNCwXG4gICAgICAgICAgICAgIC8qIGVzbGludC1kaXNhYmxlIGltcG9ydC9uby1keW5hbWljLXJlcXVpcmUsIGdsb2JhbC1yZXF1aXJlICovXG4gICAgICAgICAgICAgIGNvbnN0IGluZGljYXRvck9iamVjdCA9IHJlcXVpcmUoYC4uL2luZGljYXRvcnMvJHtcbiAgICAgICAgICAgICAgICBpbmRpY2F0b3IuZmlsZU5hbWVcbiAgICAgICAgICAgICAgfWApO1xuICAgICAgICAgICAgICAvKiBpbXBvcnQvbm8tZHluYW1pYy1yZXF1aXJlLCBnbG9iYWwtcmVxdWlyZSAqL1xuICAgICAgICAgICAgICAvLyDQkdC10YDQtdC8INCy0YHQtSDRhNGD0L3QutGG0LjQuCDQuNC90LTQuNC60LDRgtC+0YDQsFxuICAgICAgICAgICAgICBjb25zdCBpbmRpY2F0b3JGdW5jdGlvbnMgPSB7fTtcbiAgICAgICAgICAgICAgT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMoaW5kaWNhdG9yT2JqZWN0KVxuICAgICAgICAgICAgICAgIC5maWx0ZXIoXG4gICAgICAgICAgICAgICAgICBvd25Qcm9wID0+IHR5cGVvZiBpbmRpY2F0b3JPYmplY3Rbb3duUHJvcF0gPT09IFwiZnVuY3Rpb25cIlxuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAuZm9yRWFjaChvd25Qcm9wID0+IHtcbiAgICAgICAgICAgICAgICAgIGluZGljYXRvckZ1bmN0aW9uc1tvd25Qcm9wXSA9IGluZGljYXRvck9iamVjdFtvd25Qcm9wXTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgLy8g0KHQvtC30LTQsNC10Lwg0L3QvtCy0YvQuSDQuNC90YHRgtCw0L1jINCx0LDQt9C+0LLQvtCz0L4g0LjQvdC00LjQutCw0YLQvtGA0LBcbiAgICAgICAgICAgICAgdGhpc1tgXyR7a2V5fUluc3RhbmNlYF0gPSBuZXcgQmFzZUluZGljYXRvcih7XG4gICAgICAgICAgICAgICAgY29udGV4dDogdGhpcy5fY29udGV4dCxcbiAgICAgICAgICAgICAgICBleGNoYW5nZTogdGhpcy5fZXhjaGFuZ2UsXG4gICAgICAgICAgICAgICAgYXNzZXQ6IHRoaXMuX2Fzc2V0LFxuICAgICAgICAgICAgICAgIGN1cnJlbmN5OiB0aGlzLl9jdXJyZW5jeSxcbiAgICAgICAgICAgICAgICB0aW1lZnJhbWU6IHRoaXMuX3RpbWVmcmFtZSxcbiAgICAgICAgICAgICAgICBsb2c6IHRoaXMubG9nLmJpbmQodGhpcyksIC8vINGE0YPQvdC60YbQuNGPIGxvZyAtPiBhZHZpc2UubG9nXG4gICAgICAgICAgICAgICAgbG9nRXZlbnQ6IHRoaXMubG9nRXZlbnQuYmluZCh0aGlzKSwgLy8g0YTRg9C90LrRhtC40Y8gbG9nRXZlbnQgLT4gYWR2aXNlLmxvZ0V2ZW50XG4gICAgICAgICAgICAgICAgaW5kaWNhdG9yRnVuY3Rpb25zLCAvLyDRhNGD0L3QutGG0LjQuCDQuNC90LTQuNC60LDRgtC+0YDQsFxuICAgICAgICAgICAgICAgIC4uLmluZGljYXRvciAvLyDRgdGC0LXQudGCINC40L3QtNC40LrQsNGC0L7RgNCwXG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgQ2FuJ3QgbG9hZCBpbmRpY2F0b3IgJHtrZXl9IGVycm9yOlxcbiR7ZXJyfWApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuICAgICAgICAgIGNhc2UgSU5ESUNBVE9SU19UVUxJUDoge1xuICAgICAgICAgICAgLy8g0JXRgdC70Lgg0LLQvdC10YjQvdC40Lkg0LjQvdC00LjQutCw0YLQvtGAIFR1bGlwXG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAvLyDQodC+0LfQtNCw0LXQvCDQvdC+0LLRi9C5INC40L3RgdGC0LDQvWMg0LjQvdC00LjQutCw0YLQvtGA0LAgVHVsaXBcbiAgICAgICAgICAgICAgdGhpc1tgXyR7a2V5fUluc3RhbmNlYF0gPSBuZXcgVHVsaXBJbmRpY2F0b3JDbGFzcyh7XG4gICAgICAgICAgICAgICAgY29udGV4dDogdGhpcy5fY29udGV4dCxcbiAgICAgICAgICAgICAgICBleGNoYW5nZTogdGhpcy5fZXhjaGFuZ2UsXG4gICAgICAgICAgICAgICAgYXNzZXQ6IHRoaXMuX2Fzc2V0LFxuICAgICAgICAgICAgICAgIGN1cnJlbmN5OiB0aGlzLl9jdXJyZW5jeSxcbiAgICAgICAgICAgICAgICB0aW1lZnJhbWU6IHRoaXMuX3RpbWVmcmFtZSxcbiAgICAgICAgICAgICAgICBvcHRpb25zOiBpbmRpY2F0b3Iub3B0aW9ucyxcbiAgICAgICAgICAgICAgICBsb2c6IHRoaXMubG9nLmJpbmQodGhpcyksIC8vINGE0YPQvdC60YbQuNGPIGxvZyAtPiBhZHZpc2UubG9nXG4gICAgICAgICAgICAgICAgbG9nRXZlbnQ6IHRoaXMubG9nRXZlbnQuYmluZCh0aGlzKSwgLy8g0YTRg9C90LrRhtC40Y8gbG9nRXZlbnQgLT4gYWR2aXNlLmxvZ0V2ZW50XG4gICAgICAgICAgICAgICAgLi4uaW5kaWNhdG9yIC8vINGB0YLQtdC50YIg0LjQvdC00LjQutCw0YLQvtGA0LBcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICAgICAgIGBDYW4ndCBsb2FkIFR1bGlwIGluZGljYXRvciAke2tleX0gZXJyb3I6XFxuJHtlcnJ9YFxuICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAvLyDQndC10LjQt9Cy0LXRgdGC0L3Ri9C5INGC0LjQvyDQuNC90LTQuNC60LDRgtC+0YDQsCAtINC+0YjQuNCx0LrQsFxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBVbmtub3duIGluZGljYXRvciB0eXBlICR7aW5kaWNhdG9yLnR5cGV9YCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgIGBMb2FkIGluZGljYXRvcnMgXCIke3RoaXMuX3N0cmF0ZWd5TmFtZX0gZXJyb3I6XCJcXG4ke2Vycm9yfWBcbiAgICAgICk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqINCY0L3QuNGG0LjQsNC70LjQt9Cw0YbQuNGPINGB0YLRgNCw0YLQtdCz0LjQuFxuICAgKlxuICAgKiBAbWVtYmVyb2YgQWR2aXNlclxuICAgKi9cbiAgaW5pdFN0cmF0ZWd5KCkge1xuICAgIHRoaXMuX2NvbnRleHQubG9nKFwiaW5pdFN0cmF0ZWd5XCIpO1xuICAgIHRyeSB7XG4gICAgICAvLyDQldGB0LvQuCDRgdGC0YDQsNGC0LXQs9C40Y8g0LXRidC1INC90LUg0L/RgNC+0LjQvdC40YbQuNCw0LvQuNC30LjRgNC+0LLQsNC90LBcbiAgICAgIGlmICghdGhpcy5fc3RyYXRlZ3lJbnN0YW5jZS5pbml0aWFsaXplZCkge1xuICAgICAgICAvLyDQmNC90LjRhtC40LDQu9C40LfQuNGA0YPQtdC8XG4gICAgICAgIHRoaXMuX3N0cmF0ZWd5SW5zdGFuY2UuaW5pdCgpO1xuICAgICAgICB0aGlzLl9zdHJhdGVneUluc3RhbmNlLmluaXRpYWxpemVkID0gdHJ1ZTtcbiAgICAgICAgLy8g0KHRh9C40YLRi9Cy0LDQtdC8INC90LDRgdGC0YDQvtC50LrQuCDQuNC90LTQuNC60LDRgtC+0YDQvtCyXG4gICAgICAgIHRoaXMuX2luZGljYXRvcnMgPSB0aGlzLl9zdHJhdGVneUluc3RhbmNlLmluZGljYXRvcnM7XG4gICAgICAgIHRoaXMuX2NvbnRleHQubG9nKHRoaXMuX2luZGljYXRvcnMpO1xuICAgICAgICAvLyDQl9Cw0LPRgNGD0LbQsNC10Lwg0LjQvdC00LjQutCw0YLQvtGA0YtcbiAgICAgICAgdGhpcy5sb2FkSW5kaWNhdG9ycygpO1xuICAgICAgICAvLyDQmNC90LjRhtC40LDQu9C40LfQuNGA0YPQtdC8INC40L3QtNC40LrQsNGC0L7RgNGLXG4gICAgICAgIHRoaXMuaW5pdEluZGljYXRvcnMoKTtcbiAgICAgIH1cbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBJbml0IHN0cmF0ZWd5IFwiJHt0aGlzLl9zdHJhdGVneU5hbWV9IGVycm9yOlwiXFxuJHtlcnJvcn1gKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICog0JjQvdC40YbQuNCw0LvQuNC30LDRhtC40Y8g0LjQvdC00LjQutCw0YLQvtGA0L7QslxuICAgKlxuICAgKiBAbWVtYmVyb2YgQWR2aXNlclxuICAgKi9cbiAgaW5pdEluZGljYXRvcnMoKSB7XG4gICAgdGhpcy5fY29udGV4dC5sb2coXCJpbml0SW5kaWNhdG9yc1wiKTtcbiAgICB0cnkge1xuICAgICAgT2JqZWN0LmtleXModGhpcy5faW5kaWNhdG9ycykuZm9yRWFjaChrZXkgPT4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgIGlmICghdGhpc1tgXyR7a2V5fUluc3RhbmNlYF0uaW5pdGlhbGl6ZWQpIHtcbiAgICAgICAgICAgIHRoaXNbYF8ke2tleX1JbnN0YW5jZWBdLmluaXQoKTtcbiAgICAgICAgICAgIHRoaXNbYF8ke2tleX1JbnN0YW5jZWBdLmluaXRpYWxpemVkID0gdHJ1ZTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgQ2FuJ3QgaW5pdGlhbGl6ZSBpbmRpY2F0b3IgJHtrZXl9IGVycm9yOlxcbiR7ZXJyfWApO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICBgSW5pdCBpbmRpY2F0b3JzIFwiJHt0aGlzLl9zdHJhdGVneU5hbWV9IGVycm9yOlwiXFxuJHtlcnJvcn1gXG4gICAgICApO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiDQn9C10YDQtdGB0YfQtdGCINC40L3QtNC40LrQsNGC0L7RgNC+0LJcbiAgICpcbiAgICogQG1lbWJlcm9mIEFkdmlzZXJcbiAgICovXG4gIGFzeW5jIGNhbGNJbmRpY2F0b3JzKCkge1xuICAgIHRoaXMuX2NvbnRleHQubG9nKFwiY2FsY0luZGljYXRvcnNcIik7XG4gICAgdHJ5IHtcbiAgICAgIGF3YWl0IFByb21pc2UuYWxsKFxuICAgICAgICBPYmplY3Qua2V5cyh0aGlzLl9pbmRpY2F0b3JzKS5tYXAoYXN5bmMga2V5ID0+IHtcbiAgICAgICAgICB0aGlzW2BfJHtrZXl9SW5zdGFuY2VgXS5oYW5kbGVDYW5kbGUoXG4gICAgICAgICAgICB0aGlzLl9jYW5kbGUsXG4gICAgICAgICAgICB0aGlzLl9jYW5kbGVzLFxuICAgICAgICAgICAgdGhpcy5fY2FuZGxlc1Byb3BzXG4gICAgICAgICAgKTtcbiAgICAgICAgICBhd2FpdCB0aGlzW2BfJHtrZXl9SW5zdGFuY2VgXS5jYWxjKCk7XG4gICAgICAgIH0pXG4gICAgICApO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgIGBDYWxjdWxhdGUgaW5kaWNhdG9ycyBcIiR7dGhpcy5fc3RyYXRlZ3lOYW1lfSBlcnJvcjpcIlxcbiR7ZXJyb3J9YFxuICAgICAgKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICog0JvQvtCz0LjRgNC+0LLQsNC90LjQtSDQsiDQutC+0L3RgdC+0LvRjFxuICAgKlxuICAgKiBAcGFyYW0geyp9IGFyZ3NcbiAgICogQG1lbWJlcm9mIEFkdmlzZXJcbiAgICovXG4gIGxvZyguLi5hcmdzKSB7XG4gICAgaWYgKHRoaXMuX2RlYnVnKSB7XG4gICAgICB0aGlzLl9jb250ZXh0LmxvZy5pbmZvKGBBZHZpc2VyICR7dGhpcy5fZXZlbnRTdWJqZWN0fTpgLCAuLi5hcmdzKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICog0JvQvtCz0LjRgNC+0LLQsNC90LjQtSDQsiBFdmVudEdyaWQg0LIg0YLQvtC/0LjQuiBDUFotTE9HU1xuICAgKlxuICAgKiBAcGFyYW0geyp9IGRhdGFcbiAgICogQG1lbWJlcm9mIEFkdmlzZXJcbiAgICovXG4gIGxvZ0V2ZW50KGRhdGEpIHtcbiAgICAvLyDQn9GD0LHQu9C40LrRg9C10Lwg0YHQvtCx0YvRgtC40LVcbiAgICBwdWJsaXNoRXZlbnRzKFxuICAgICAgdGhpcy5fY29udGV4dCxcbiAgICAgIFwibG9nXCIsXG4gICAgICBjcmVhdGVFdmVudHMoe1xuICAgICAgICBzdWJqZWN0OiB0aGlzLl9ldmVudFN1YmplY3QsXG4gICAgICAgIGV2ZW50VHlwZTogTE9HX0FEVklTRVJfRVZFTlQuZXZlbnRUeXBlLFxuICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgdGFza0lkOiB0aGlzLl90YXNrSWQsXG4gICAgICAgICAgZGF0YVxuICAgICAgICB9XG4gICAgICB9KVxuICAgICk7XG4gIH1cblxuICAvKipcbiAgICog0JfQsNC/0YDQvtGBINGC0LXQutGD0YnQtdCz0L4g0YHRgtCw0YLRg9GB0LAg0YHQtdGA0LLQuNGB0LBcbiAgICpcbiAgICogQHJldHVybnMgc3RhdHVzXG4gICAqIEBtZW1iZXJvZiBBZHZpc2VyXG4gICAqL1xuICBnZXQgc3RhdHVzKCkge1xuICAgIHJldHVybiB0aGlzLl9zdGF0dXM7XG4gIH1cblxuICAvKipcbiAgICog0JfQsNC/0YDQvtGBINGC0LXQutGD0YnQtdCz0L4g0L/RgNC40LfQvdCw0LrQsCDQvtCx0L3QvtCy0LvQtdC90LjRjyDQv9Cw0YDQsNC80LXRgtGA0L7QslxuICAgKlxuICAgKiBAcmV0dXJucyB1cGRhdGVSZXF1ZXN0ZWRcbiAgICogQG1lbWJlcm9mIEFkdmlzZXJcbiAgICovXG4gIGdldCB1cGRhdGVSZXF1ZXN0ZWQoKSB7XG4gICAgcmV0dXJuIHRoaXMuX3VwZGF0ZVJlcXVlc3RlZDtcbiAgfVxuXG4gIC8qKlxuICAgKiDQo9GB0YLQsNC90L7QstC60LAg0YHRgtCw0YLRg9GB0LAg0YHQtdGA0LLQuNGB0LBcbiAgICpcbiAgICogQHBhcmFtIHsqfSBzdGF0dXNcbiAgICogQG1lbWJlcm9mIEFkdmlzZXJcbiAgICovXG4gIHNldCBzdGF0dXMoc3RhdHVzKSB7XG4gICAgaWYgKHN0YXR1cykgdGhpcy5fc3RhdHVzID0gc3RhdHVzO1xuICB9XG5cbiAgLyoqXG4gICAqINCj0YHRgtCw0L3QvtCy0LrQsCDQvdC+0LLRi9GFINC/0LDRgNCw0LzQtdGC0YDQvtCyXG4gICAqXG4gICAqIEBwYXJhbSB7Kn0gW3VwZGF0ZWRGaWVsZHM9dGhpcy51cGRhdGVSZXF1ZXN0ZWRdXG4gICAqIEBtZW1iZXJvZiBBZHZpc2VyXG4gICAqL1xuICBzZXRVcGRhdGUodXBkYXRlZEZpZWxkcyA9IHRoaXMuX3VwZGF0ZVJlcXVlc3RlZCkge1xuICAgIHRoaXMubG9nKGBzZXRVcGRhdGUoKWAsIHVwZGF0ZWRGaWVsZHMpO1xuICAgIHRoaXMuX2RlYnVnID0gdXBkYXRlZEZpZWxkcy5kZWJ1ZyB8fCB0aGlzLl9kZWJ1ZztcbiAgICB0aGlzLl9zZXR0aW5ncyA9IHVwZGF0ZWRGaWVsZHMuc2V0dGluZ3MgfHwgdGhpcy5fc2V0dGluZ3M7XG4gICAgdGhpcy5fcmVxdWlyZWRIaXN0b3J5Q2FjaGUgPVxuICAgICAgdXBkYXRlZEZpZWxkcy5fcmVxdWlyZWRIaXN0b3J5Q2FjaGUgfHwgdGhpcy5fcmVxdWlyZWRIaXN0b3J5Q2FjaGU7XG4gICAgdGhpcy5fcmVxdWlyZWRIaXN0b3J5TWF4QmFycyA9XG4gICAgICB1cGRhdGVkRmllbGRzLl9yZXF1aXJlZEhpc3RvcnlNYXhCYXJzIHx8IHRoaXMuX3JlcXVpcmVkSGlzdG9yeU1heEJhcnM7XG4gIH1cblxuICAvKipcbiAgICog0JfQsNCz0YDRg9C30LrQsCDRgdCy0LXRh9C10Lkg0LjQtyDQutGN0YjQsFxuICAgKlxuICAgKiBAbWVtYmVyb2YgQWR2aXNlclxuICAgKi9cbiAgYXN5bmMgX2xvYWRDYW5kbGVzKCkge1xuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGdldENhY2hlZENhbmRsZXNCeUtleShcbiAgICAgIHRoaXMuX2NvbnRleHQsXG4gICAgICBgJHt0aGlzLl9leGNoYW5nZX0uJHt0aGlzLl9hc3NldH0uJHt0aGlzLl9jdXJyZW5jeX0uJHt0aGlzLl90aW1lZnJhbWV9YCxcbiAgICAgIHRoaXMuX3JlcXVpcmVkSGlzdG9yeU1heEJhcnNcbiAgICApO1xuICAgIGlmIChyZXN1bHQuaXNTdWNjZXNzKSB7XG4gICAgICB0aGlzLl9jYW5kbGVzID0gcmVzdWx0LmRhdGEucmV2ZXJzZSgpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyByZXN1bHQuZXJyb3I7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqINCf0YDQtdC+0LHRgNCw0LfQvtCy0LDQvdC40LUg0YHQstC10YfQtdC5INC00LvRjyDQuNC90LTQuNC60LDRgtC+0YDQvtCyXG4gICAqXG4gICAqIEBtZW1iZXJvZiBBZHZpc2VyXG4gICAqL1xuICBfcHJlcGFyZUNhbmRsZXMoKSB7XG4gICAgdGhpcy5fY2FuZGxlc1Byb3BzID0ge1xuICAgICAgb3BlbjogW10sXG4gICAgICBoaWdoOiBbXSxcbiAgICAgIGxvdzogW10sXG4gICAgICBjbG9zZTogW10sXG4gICAgICB2b2x1bWU6IFtdXG4gICAgfTtcbiAgICB0aGlzLl9jYW5kbGVzLmZvckVhY2goY2FuZGxlID0+IHtcbiAgICAgIHRoaXMuX2NhbmRsZXNQcm9wcy5vcGVuLnB1c2goY2FuZGxlLm9wZW4pO1xuICAgICAgdGhpcy5fY2FuZGxlc1Byb3BzLmhpZ2gucHVzaChjYW5kbGUuaGlnaCk7XG4gICAgICB0aGlzLl9jYW5kbGVzUHJvcHMubG93LnB1c2goY2FuZGxlLmxvdyk7XG4gICAgICB0aGlzLl9jYW5kbGVzUHJvcHMuY2xvc2UucHVzaChjYW5kbGUuY2xvc2UpO1xuICAgICAgdGhpcy5fY2FuZGxlc1Byb3BzLnZvbHVtZS5wdXNoKGNhbmRsZS52b2x1bWUpO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqINCe0LHRgNCw0LHQvtGC0LrQsCDQvdC+0LLQvtC5INGB0LLQtdGH0LhcbiAgICpcbiAgICogQHBhcmFtIHsqfSBjYW5kbGVcbiAgICogQG1lbWJlcm9mIEFkdmlzZXJcbiAgICovXG4gIGFzeW5jIGhhbmRsZUNhbmRsZShjYW5kbGUpIHtcbiAgICB0cnkge1xuICAgICAgdGhpcy5sb2coXCJoYW5kbGVDYW5kbGVcIik7XG4gICAgICAvLyBUT0RPOiDQn9GA0L7QstC10YDQuNGC0Ywg0YfRgtC+INGN0YLQsCDRgdCy0LXRh9CwINC10YnQtSDQvdC1INC+0LHRgNCw0LHQsNGC0YvQstCw0LvQsNGB0YxcbiAgICAgIC8vINCe0LHQvdC+0LLQuNGC0Ywg0YLQtdC60YPRidGD0Y4g0YHQstC10YfRg1xuICAgICAgdGhpcy5fY2FuZGxlID0gY2FuZGxlO1xuICAgICAgLy8g0JXRgdC70Lgg0L3Rg9C20L3QsCDQuNGB0YLQvtGA0LjRj1xuICAgICAgaWYgKHRoaXMuX3JlcXVpcmVkSGlzdG9yeUNhY2hlKSB7XG4gICAgICAgIC8vINCX0LDQs9GA0YPQt9C40YLRjCDRgdCy0LXRh9C4INC40Lcg0LrQtdGI0LBcbiAgICAgICAgYXdhaXQgdGhpcy5fbG9hZENhbmRsZXMoKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vINCe0LHRgNCw0LHQsNGC0YvQstCw0LXQvCDRgtC+0LvRjNC60L4g0YLQtdC60YPRidGD0Y4g0YHQstC10YfRg1xuICAgICAgICB0aGlzLl9jYW5kbGVzLnB1c2godGhpcy5fY2FuZGxlKTtcbiAgICAgIH1cbiAgICAgIC8vINCf0L7QtNCz0L7RgtC+0LLQuNGC0Ywg0YHQstC10YfQuCDQtNC70Y8g0LjQvdC00LjQutCw0YLQvtGA0L7QslxuICAgICAgdGhpcy5fcHJlcGFyZUNhbmRsZXMoKTtcbiAgICAgIC8vINCg0LDRgdGB0YfQuNGC0LDRgtGMINC30L3QsNGH0LXQvdC40Y8g0LjQvdC00LjQutCw0YLQvtGA0L7QslxuICAgICAgYXdhaXQgdGhpcy5jYWxjSW5kaWNhdG9ycygpO1xuICAgICAgLy8g0KHRh9C40YLQsNGC0Ywg0YLQtdC60YPRidC10LUg0YHQvtGB0YLQvtGP0L3QuNC1INC40L3QtNC40LrQsNGC0L7RgNC+0LJcbiAgICAgIHRoaXMuZ2V0SW5kaWNhdG9yc1N0YXRlKCk7XG4gICAgICAvLyDQn9C10YDQtdC00LDRgtGMINGB0LLQtdGH0YMg0Lgg0LfQvdCw0YfQtdC90LjRjyDQuNC90LTQuNC60LDRgtC+0YDQvtCyINCyINC40L3RgdGC0LDQvdGBINGB0YLRgNCw0YLQtdCz0LjQuFxuICAgICAgdGhpcy5fc3RyYXRlZ3lJbnN0YW5jZS5oYW5kbGVDYW5kbGUodGhpcy5fY2FuZGxlLCB0aGlzLl9pbmRpY2F0b3JzKTtcbiAgICAgIC8vINCX0LDQv9GD0YHRgtC40YLRjCDQv9GA0L7QstC10YDQutGDINGB0YLRgNCw0YLQtdCz0LjQuFxuICAgICAgdGhpcy5fc3RyYXRlZ3lJbnN0YW5jZS5jaGVjaygpO1xuICAgICAgLy8gVE9ETzog0J7RgtC00LXQu9GM0L3Ri9C5INC80LXRgtC+0LQgY2hlY2sg0YEg0L7RgtC70L7QstC+0Lwg0L7RiNC40LHQvtC6P1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICB0aGlzLl9jb250ZXh0LmxvZy5lcnJvcihlcnJvcik7XG4gICAgICB0aHJvdyBlcnJvcjtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICog0JPQtdC90LXRgNCw0YbQuNGPINGC0LXQvNGLINGB0L7QsdGL0YLQuNGPIE5ld1NpZ25hbFxuICAgKlxuICAgKiBAcmV0dXJucyBzdWJqZWN0XG4gICAqIEBtZW1iZXJvZiBDYW5kbGViYXRjaGVyXG4gICAqL1xuICBfY3JlYXRlU3ViamVjdCgpIHtcbiAgICBjb25zdCBtb2RlVG9TdHIgPSBtb2RlID0+IHtcbiAgICAgIHN3aXRjaCAobW9kZSkge1xuICAgICAgICBjYXNlIFwicmVhbHRpbWVcIjpcbiAgICAgICAgICByZXR1cm4gXCJSXCI7XG4gICAgICAgIGNhc2UgXCJiYWNrdGVzdFwiOlxuICAgICAgICAgIHJldHVybiBcIkJcIjtcbiAgICAgICAgY2FzZSBcImVtdWxhdG9yXCI6XG4gICAgICAgICAgcmV0dXJuIFwiRVwiO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgIHJldHVybiBcIlJcIjtcbiAgICAgIH1cbiAgICB9O1xuICAgIHJldHVybiBgJHt0aGlzLl9leGNoYW5nZX0vJHt0aGlzLl9hc3NldH0vJHt0aGlzLl9jdXJyZW5jeX0vJHtcbiAgICAgIHRoaXMuX3RpbWVmcmFtZVxuICAgIH0vJHt0aGlzLl90YXNrSWR9LiR7bW9kZVRvU3RyKHRoaXMuX21vZGUpfWA7XG4gIH1cblxuICAvKipcbiAgICog0JPQtdC90LXRgNCw0YbQuNGPINGB0L7QsdGL0YLQuNGPIE5ld1NpZ25hbFxuICAgKlxuICAgKiBAcGFyYW0geyp9IHNpZ25hbFxuICAgKiBAbWVtYmVyb2YgQWR2aXNlclxuICAgKi9cbiAgYWR2aWNlKHNpZ25hbCkge1xuICAgIGNvbnN0IG5ld1NpZ25hbCA9IHtcbiAgICAgIGlkOiB1dWlkKCksXG4gICAgICBkYXRhVmVyc2lvbjogXCIxLjBcIixcbiAgICAgIGV2ZW50VGltZTogbmV3IERhdGUoKSxcbiAgICAgIHN1YmplY3Q6IHRoaXMuX2NyZWF0ZVN1YmplY3QoKSxcbiAgICAgIGV2ZW50VHlwZTogU0lHTkFMU19ORVdTSUdOQUxfRVZFTlQuZXZlbnRUeXBlLFxuICAgICAgZGF0YToge1xuICAgICAgICBpZDogdXVpZCgpLFxuICAgICAgICByb2JvdElkOiB0aGlzLl9yb2JvdElkLFxuICAgICAgICBhZHZpc29ySWQ6IHRoaXMuX3Rhc2tJZCxcbiAgICAgICAgZXhjaGFuZ2U6IHRoaXMuX2V4Y2hhbmdlLFxuICAgICAgICBhc3NldDogdGhpcy5fYXNzZXQsXG4gICAgICAgIGN1cnJlbmN5OiB0aGlzLl9jdXJyZW5jeSxcbiAgICAgICAgLi4uc2lnbmFsXG4gICAgICB9XG4gICAgfTtcblxuICAgIHRoaXMuX3NpZ25hbHMucHVzaChuZXdTaWduYWwpO1xuICB9XG5cbiAgLyoqXG4gICAqINCX0LDQv9GA0L7RgSDRgtC10LrRg9GJ0LjRhSDRgdC+0LHRi9GC0LjQuSDQtNC70Y8g0L7RgtC/0YDQsNCy0LrQuFxuICAgKlxuICAgKiBAbWVtYmVyb2YgQWR2aXNlclxuICAgKi9cbiAgZ2V0IGV2ZW50cygpIHtcbiAgICByZXR1cm4gdGhpcy5fc2lnbmFscztcbiAgfVxuXG4gIC8qKlxuICAgKiDQl9Cw0L/RgNC+0YEg0YLQtdC60YPRidC10LPQviDRgdC+0YHRgtC+0Y/QvdC40Y8g0LjQvdC00LjQutCw0YLQvtGA0L7QslxuICAgKlxuICAgKiBAbWVtYmVyb2YgQWR2aXNlclxuICAgKi9cbiAgZ2V0SW5kaWNhdG9yc1N0YXRlKCkge1xuICAgIHRyeSB7XG4gICAgICBPYmplY3Qua2V5cyh0aGlzLl9pbmRpY2F0b3JzKS5mb3JFYWNoKGluZCA9PiB7XG4gICAgICAgIHRoaXMuX2luZGljYXRvcnNbaW5kXS5pbml0aWFsaXplZCA9IHRoaXNbYF8ke2luZH1JbnN0YW5jZWBdLmluaXRpYWxpemVkO1xuICAgICAgICB0aGlzLl9pbmRpY2F0b3JzW2luZF0ub3B0aW9ucyA9IHRoaXNbYF8ke2luZH1JbnN0YW5jZWBdLm9wdGlvbnM7XG4gICAgICAgIC8vINCS0YHQtSDRgdCy0L7QudGB0YLQstCwINC40L3RgdGC0LDQvdGB0LAg0YHRgtGA0LDRgtC10LPQuNC4XG4gICAgICAgIE9iamVjdC5rZXlzKHRoaXNbYF8ke2luZH1JbnN0YW5jZWBdKVxuICAgICAgICAgIC5maWx0ZXIoa2V5ID0+ICFrZXkuc3RhcnRzV2l0aChcIl9cIikpIC8vINC/0YPQsdC70LjRh9C90YvQtSAo0L3QtSDQvdCw0YfQuNC90LDRjtGC0YHRjyDRgSBcIl9cIilcbiAgICAgICAgICAuZm9yRWFjaChrZXkgPT4ge1xuICAgICAgICAgICAgaWYgKHR5cGVvZiB0aGlzW2BfJHtpbmR9SW5zdGFuY2VgXVtrZXldICE9PSBcImZ1bmN0aW9uXCIpXG4gICAgICAgICAgICAgIHRoaXMuX2luZGljYXRvcnNbaW5kXS52YXJpYWJsZXNba2V5XSA9IHRoaXNbYF8ke2luZH1JbnN0YW5jZWBdW1xuICAgICAgICAgICAgICAgIGtleVxuICAgICAgICAgICAgICBdOyAvLyDRgdC+0YXRgNCw0L3Rj9C10Lwg0LrQsNC20LTQvtC1INGB0LLQvtC50YHRgtCy0L5cbiAgICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgIGBDYW4ndCBmaW5kIGluZGljYXRvcnMgc3RhdGUgZm9yIHN0cmF0ZWd5IFwiJHtcbiAgICAgICAgICB0aGlzLl9zdHJhdGVneU5hbWVcbiAgICAgICAgfVwiIFxcbiR7ZXJyb3J9YFxuICAgICAgKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICog0JfQsNC/0YDQvtGBINGC0LXQutGD0YnQtdCz0L4g0YHQvtGB0YLQvtGP0L3QuNGPINGB0YLRgNCw0YLQtdCz0LjQuFxuICAgKlxuICAgKiBAbWVtYmVyb2YgQWR2aXNlclxuICAgKi9cbiAgZ2V0U3RyYXRlZ3lTdGF0ZSgpIHtcbiAgICB0cnkge1xuICAgICAgdGhpcy5fc3RyYXRlZ3kuX2luaXRpYWxpemVkID0gdGhpcy5fc3RyYXRlZ3lJbnN0YW5jZS5pbml0aWFsaXplZDtcbiAgICAgIC8vINCS0YHQtSDRgdCy0L7QudGB0YLQstCwINC40L3RgdGC0LDQvdGB0LAg0YHRgtGA0LDRgtC10LPQuNC4XG4gICAgICBPYmplY3Qua2V5cyh0aGlzLl9zdHJhdGVneUluc3RhbmNlKVxuICAgICAgICAuZmlsdGVyKGtleSA9PiAha2V5LnN0YXJ0c1dpdGgoXCJfXCIpKSAvLyDQv9GD0LHQu9C40YfQvdGL0LUgKNC90LUg0L3QsNGH0LjQvdCw0Y7RgtGB0Y8g0YEgXCJfXCIpXG4gICAgICAgIC5mb3JFYWNoKGtleSA9PiB7XG4gICAgICAgICAgaWYgKHR5cGVvZiB0aGlzLl9zdHJhdGVneUluc3RhbmNlW2tleV0gIT09IFwiZnVuY3Rpb25cIilcbiAgICAgICAgICAgIHRoaXMuX3N0cmF0ZWd5LnZhcmlhYmxlc1trZXldID0gdGhpcy5fc3RyYXRlZ3lJbnN0YW5jZVtrZXldOyAvLyDRgdC+0YXRgNCw0L3Rj9C10Lwg0LrQsNC20LTQvtC1INGB0LLQvtC50YHRgtCy0L5cbiAgICAgICAgfSk7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgYENhbid0IGZpbmQgc3RyYXRlZ3kgc3RhdGUgXCIke3RoaXMuX3N0cmF0ZWd5TmFtZX1cIiBcXG4ke2Vycm9yfWBcbiAgICAgICk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqINCX0LDQv9GA0L7RgSDQstGB0LXQs9C+INGC0LXQutGD0YnQtdCz0L4g0YHQvtGB0YLQvtGP0L3QuNGPXG4gICAqXG4gICAqIEByZXR1cm5zIHtvYmplY3R9XG4gICAqIEBtZW1iZXJvZiBBZHZpc2VyXG4gICAqL1xuICBnZXQgY3VycmVudFN0YXRlKCkge1xuICAgIHRoaXMuZ2V0SW5kaWNhdG9yc1N0YXRlKCk7XG4gICAgdGhpcy5nZXRTdHJhdGVneVN0YXRlKCk7XG4gICAgcmV0dXJuIHtcbiAgICAgIGV2ZW50U3ViamVjdDogdGhpcy5fZXZlbnRTdWJqZWN0LFxuICAgICAgdGFza0lkOiB0aGlzLl90YXNrSWQsXG4gICAgICByb2JvdElkOiB0aGlzLl9yb2JvdElkLFxuICAgICAgbW9kZTogdGhpcy5fbW9kZSxcbiAgICAgIGRlYnVnOiB0aGlzLl9kZWJ1ZyxcbiAgICAgIHNldHRpbmdzOiB0aGlzLl9zZXR0aW5ncyxcbiAgICAgIGV4Y2hhbmdlOiB0aGlzLl9leGNoYW5nZSxcbiAgICAgIGFzc2V0OiB0aGlzLl9hc3NldCxcbiAgICAgIGN1cnJlbmN5OiB0aGlzLl9jdXJyZW5jeSxcbiAgICAgIHRpbWVmcmFtZTogdGhpcy5fdGltZWZyYW1lLFxuICAgICAgbGFzdENhbmRsZTogdGhpcy5fbGFzdENhbmRsZSxcbiAgICAgIGxhc3RTaWduYWxzOiB0aGlzLl9sYXN0U2lnbmFscyxcbiAgICAgIHN0cmF0ZWd5TmFtZTogdGhpcy5fc3RyYXRlZ3lOYW1lLFxuICAgICAgc3RyYXRlZ3k6IHRoaXMuX3N0cmF0ZWd5LFxuICAgICAgaW5kaWNhdG9yczogdGhpcy5faW5kaWNhdG9ycyxcbiAgICAgIHVwZGF0ZVJlcXVlc3RlZDogdGhpcy5fdXBkYXRlUmVxdWVzdGVkLFxuICAgICAgc3RvcFJlcXVlc3RlZDogdGhpcy5fc3RvcFJlcXVlc3RlZCxcbiAgICAgIHN0YXR1czogdGhpcy5fc3RhdHVzLFxuICAgICAgc3RhcnRlZEF0OiB0aGlzLl9zdGFydGVkQXQsXG4gICAgICBlbmRlZEF0OiB0aGlzLl9lbmRlZEF0LFxuICAgICAgaW5pdGlhbGl6ZWQ6IHRoaXMuX2luaXRpYWxpemVkXG4gICAgfTtcbiAgfVxuXG4gIC8qKlxuICAgKiDQodC+0YXRgNCw0L3QtdC90LjQtSDQstGB0LXQs9C+INGC0LXQutGD0YnQtdCz0L4g0YHQvtGB0YLQvtGP0L3QuNGPINCyINC70L7QutCw0LvRjNC90L7QtSDRhdGA0LDQvdC40LvQuNGJ0LVcbiAgICpcbiAgICogQG1lbWJlcm9mIEFkdmlzZXJcbiAgICovXG4gIGFzeW5jIHNhdmUoKSB7XG4gICAgdGhpcy5sb2coYHNhdmUoKWApO1xuICAgIC8vINCh0L7RhdGA0LDQvdGP0LXQvCDRgdC+0YHRgtC+0Y/QvdC40LUg0LIg0LvQvtC60LDQu9GM0L3QvtC8INGF0YDQsNC90LjQu9C40YnQtVxuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHNhdmVBZHZpc2VyU3RhdGUodGhpcy5fY29udGV4dCwgdGhpcy5jdXJyZW50U3RhdGUpO1xuICAgIGlmICghcmVzdWx0LmlzU3VjY2VzcylcbiAgICAgIHRocm93IG5ldyBFcnJvcihgQ2FuJ3QgdXBkYXRlIHN0YXRlXFxuJHtyZXN1bHQuZXJyb3J9YCk7XG4gIH1cblxuICAvKipcbiAgICog0JfQsNCy0LXRgNGI0LXQvdC40LUg0YDQsNCx0L7RgtGLINC40YLQtdGA0LDRhtC40LhcbiAgICpcbiAgICogQHBhcmFtIHsqfSBzdGF0dXNcbiAgICogQHBhcmFtIHsqfSBlcnJvclxuICAgKiBAbWVtYmVyb2YgQWR2aXNlclxuICAgKi9cbiAgYXN5bmMgZW5kKHN0YXR1cywgZXJyb3IpIHtcbiAgICB0aGlzLmxvZyhgZW5kKClgKTtcbiAgICB0aGlzLl9zdGF0dXMgPSBzdGF0dXM7XG4gICAgdGhpcy5fZXJyb3IgPSBlcnJvcjtcbiAgICB0aGlzLl91cGRhdGVSZXF1ZXN0ZWQgPSBmYWxzZTsgLy8g0J7QsdC90YPQu9GP0LXQvCDQt9Cw0L/RgNC+0YEg0L3QsCDQvtCx0L3QvtCy0LvQtdC90LjQtSDQv9Cw0YDQsNC80LXRgtGA0L7QslxuICAgIHRoaXMuX3N0b3BSZXF1ZXN0ZWQgPSBmYWxzZTsgLy8g0J7QsdC90YPQu9GP0LXQvCDQt9Cw0L/RgNC+0YEg0L3QsCDQvtGB0YLQsNC90L7QstC60YMg0YHQtdGA0LLQuNGB0LBcbiAgICB0aGlzLl9sYXN0U2lnbmFscyA9IHRoaXMuX3NpZ25hbHM7XG4gICAgdGhpcy5fbGFzdENhbmRsZSA9IHRoaXMuX2NhbmRsZTtcbiAgICBhd2FpdCB0aGlzLnNhdmUoKTtcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBBZHZpc2VyO1xuIiwiY2xhc3MgQmFzZUluZGljYXRvciB7XG4gIGNvbnN0cnVjdG9yKHN0YXRlKSB7XG4gICAgdGhpcy5fY29udGV4dCA9IHN0YXRlLmNvbnRleHQ7IC8vINGC0LXQutGD0YnQuNC5INC60L7QvdGC0LXQutGB0YIg0LLRi9C/0L7Qu9C90LXQvdC40Y9cbiAgICB0aGlzLl9uYW1lID0gc3RhdGUubmFtZTtcbiAgICB0aGlzLl9pbmRpY2F0b3JOYW1lID0gc3RhdGUuaW5kaWNhdG9yTmFtZTtcbiAgICB0aGlzLl9pbml0aWFsaXplZCA9IHN0YXRlLmluaXRpYWxpemVkIHx8IGZhbHNlOyAvLyDQuNC90LTQuNC60LDRgtC+0YAg0LjQvdC40YbQuNCw0LvQuNC30LjRgNC+0LLQsNC9XG4gICAgdGhpcy5fZXhjaGFuZ2UgPSBzdGF0ZS5leGNoYW5nZTtcbiAgICB0aGlzLl9hc3NldCA9IHN0YXRlLmFzc2V0O1xuICAgIHRoaXMuX2N1cnJlbmN5ID0gc3RhdGUuY3VycmVuY3k7XG4gICAgdGhpcy5fdGltZWZyYW1lID0gc3RhdGUudGltZWZyYW1lO1xuICAgIHRoaXMuX29wdGlvbnMgPSBzdGF0ZS5vcHRpb25zO1xuICAgIHRoaXMuX2NhbmRsZSA9IG51bGw7XG4gICAgdGhpcy5fY2FuZGxlcyA9IFtdO1xuICAgIHRoaXMuX2NhbmRsZXNQcm9wcyA9IHtcbiAgICAgIG9wZW46IFtdLFxuICAgICAgaGlnaDogW10sXG4gICAgICBsb3c6IFtdLFxuICAgICAgY2xvc2U6IFtdLFxuICAgICAgdm9sdW1lOiBbXVxuICAgIH07XG4gICAgdGhpcy5fdHVsaXBJbmRpY2F0b3JzID0gc3RhdGUudHVsaXBJbmRpY2F0b3JzIHx8IHt9O1xuICAgIHRoaXMuX2xvZyA9IHN0YXRlLmxvZzsgLy8g0KTRg9C90LrRhtC40Y8g0LvQvtCz0LjRgNC+0LLQsNC90LjRjyDQsiDQutC+0L3RgdC+0LvRjFxuICAgIHRoaXMuX2xvZ0V2ZW50ID0gc3RhdGUubG9nRXZlbnQ7IC8vINCk0YPQvdC60YbQuNGPINC70L7Qs9C40YDQvtCy0LDQvdC40Y8g0LIgRXZlbnRHcmlkINCyINGC0L7Qv9C40LogQ1BaLUxPR1NcbiAgICBpZiAoc3RhdGUudmFyaWFibGVzKSB7XG4gICAgICBPYmplY3Qua2V5cyhzdGF0ZS52YXJpYWJsZXMpLmZvckVhY2goa2V5ID0+IHtcbiAgICAgICAgdGhpc1trZXldID0gc3RhdGUudmFyaWFibGVzW2tleV07XG4gICAgICB9KTtcbiAgICB9XG4gICAgaWYgKHN0YXRlLmluZGljYXRvckZ1bmN0aW9ucykge1xuICAgICAgT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMoc3RhdGUuaW5kaWNhdG9yRnVuY3Rpb25zKS5mb3JFYWNoKGtleSA9PiB7XG4gICAgICAgIHRoaXNba2V5XSA9IHN0YXRlLmluZGljYXRvckZ1bmN0aW9uc1trZXldO1xuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgaW5pdCgpIHt9XG5cbiAgY2FsYygpIHt9XG5cbiAgZG9uZSgpIHtcbiAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XG4gIH1cblxuICBfaGFuZGxlQ2FuZGxlKGNhbmRsZSwgY2FuZGxlcywgY2FuZGxlc1Byb3BzKSB7XG4gICAgdGhpcy5fY2FuZGxlID0gY2FuZGxlO1xuICAgIHRoaXMuX2NhbmRsZXMgPSBjYW5kbGVzO1xuICAgIHRoaXMuX2NhbmRsZXNQcm9wcyA9IGNhbmRsZXNQcm9wcztcbiAgfVxuXG4gIGdldCBoYW5kbGVDYW5kbGUoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2hhbmRsZUNhbmRsZTtcbiAgfVxuXG4gIGdldCBpbml0aWFsaXplZCgpIHtcbiAgICByZXR1cm4gdGhpcy5faW5pdGlhbGl6ZWQ7XG4gIH1cblxuICBzZXQgaW5pdGlhbGl6ZWQodmFsdWUpIHtcbiAgICB0aGlzLl9pbml0aWFsaXplZCA9IHZhbHVlO1xuICB9XG5cbiAgZ2V0IG9wdGlvbnMoKSB7XG4gICAgcmV0dXJuIHRoaXMuX29wdGlvbnM7XG4gIH1cblxuICBnZXQgZXhjaGFuZ2UoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2V4Y2hhbmdlO1xuICB9XG5cbiAgZ2V0IGFzc2V0KCkge1xuICAgIHJldHVybiB0aGlzLl9hc3NldDtcbiAgfVxuXG4gIGdldCBjdXJyZW5jeSgpIHtcbiAgICByZXR1cm4gdGhpcy5f0YF1cnJlbmN5O1xuICB9XG5cbiAgZ2V0IHRpbWVmcmFtZSgpIHtcbiAgICByZXR1cm4gdGhpcy5fdGltZWZyYW1lO1xuICB9XG5cbiAgZ2V0IGNhbmRsZSgpIHtcbiAgICByZXR1cm4gdGhpcy5fY2FuZGxlO1xuICB9XG5cbiAgZ2V0IGNhbmRsZXMoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2NhbmRsZXM7XG4gIH1cblxuICBnZXQgY2FuZGxlc1Byb3BzKCkge1xuICAgIHJldHVybiB0aGlzLl9jYW5kbGVzUHJvcHM7XG4gIH1cblxuICBnZXQgbG9nKCkge1xuICAgIHJldHVybiB0aGlzLl9sb2c7XG4gIH1cblxuICBnZXQgbG9nRXZlbnQoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2xvZ0V2ZW50O1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IEJhc2VJbmRpY2F0b3I7XG4iLCJpbXBvcnQgeyBJTkRJQ0FUT1JTX0JBU0UsIElORElDQVRPUlNfVFVMSVAgfSBmcm9tIFwiY3B6U3RhdGVcIjtcblxuY2xhc3MgQmFzZVN0cmF0ZWd5IHtcbiAgY29uc3RydWN0b3Ioc3RhdGUpIHtcbiAgICB0aGlzLl9jb250ZXh0ID0gc3RhdGUuY29udGV4dDsgLy8g0YLQtdC60YPRidC40Lkg0LrQvtC90YLQtdC60YHRgiDQstGL0L/QvtC70L3QtdC90LjRj1xuICAgIHRoaXMuX2luaXRpYWxpemVkID0gc3RhdGUuaW5pdGlhbGl6ZWQgfHwgZmFsc2U7IC8vINGB0YLRgNCw0YLQtdCz0LjRjyDQuNC90LjRhtC40LDQu9C40LfQuNGA0L7QstCw0L3QsFxuICAgIHRoaXMuX3NldHRpbmdzID0gc3RhdGUuc2V0dGluZ3M7XG4gICAgdGhpcy5fZXhjaGFuZ2UgPSBzdGF0ZS5leGNoYW5nZTtcbiAgICB0aGlzLl9hc3NldCA9IHN0YXRlLmFzc2V0O1xuICAgIHRoaXMuX2N1cnJlbmN5ID0gc3RhdGUuY3VycmVuY3k7XG4gICAgdGhpcy5fdGltZWZyYW1lID0gc3RhdGUudGltZWZyYW1lO1xuICAgIHRoaXMuX2NhbmRsZSA9IG51bGw7XG4gICAgdGhpcy5faW5kaWNhdG9ycyA9IHN0YXRlLmluZGljYXRvcnMgfHwge307XG4gICAgdGhpcy5fYWR2aWNlID0gc3RhdGUuYWR2aWNlOyAvLyDQk9C10L3QtdGA0LDRhtC40Y8g0YHQvtCx0YvRgtC40Y8gTmV3U2lnbmFsXG4gICAgdGhpcy5fbG9nID0gc3RhdGUubG9nOyAvLyDQpNGD0L3QutGG0LjRjyDQu9C+0LPQuNGA0L7QstCw0L3QuNGPINCyINC60L7QvdGB0L7Qu9GMXG4gICAgdGhpcy5fbG9nRXZlbnQgPSBzdGF0ZS5sb2dFdmVudDsgLy8g0KTRg9C90LrRhtC40Y8g0LvQvtCz0LjRgNC+0LLQsNC90LjRjyDQsiBFdmVudEdyaWQg0LIg0YLQvtC/0LjQuiBDUFotTE9HU1xuICAgIGlmIChzdGF0ZS52YXJpYWJsZXMpIHtcbiAgICAgIE9iamVjdC5rZXlzKHN0YXRlLnZhcmlhYmxlcykuZm9yRWFjaChrZXkgPT4ge1xuICAgICAgICB0aGlzW2tleV0gPSBzdGF0ZS52YXJpYWJsZXNba2V5XTtcbiAgICAgIH0pO1xuICAgIH1cbiAgICBpZiAoc3RhdGUuc3RyYXRlZ3lGdW5jdGlvbnMpIHtcbiAgICAgIE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKHN0YXRlLnN0cmF0ZWd5RnVuY3Rpb25zKS5mb3JFYWNoKGtleSA9PiB7XG4gICAgICAgIHRoaXMuX2NvbnRleHQubG9nKHN0YXRlLnN0cmF0ZWd5RnVuY3Rpb25zW2tleV0pO1xuICAgICAgICB0aGlzW2tleV0gPSBzdGF0ZS5zdHJhdGVneUZ1bmN0aW9uc1trZXldO1xuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgaW5pdCgpIHt9XG5cbiAgY2hlY2soKSB7fVxuXG4gIF9oYW5kbGVDYW5kbGUoY2FuZGxlLCBpbmRpY2F0b3JzKSB7XG4gICAgdGhpcy5fY2FuZGxlID0gY2FuZGxlO1xuICAgIHRoaXMuX2luZGljYXRvcnMgPSBpbmRpY2F0b3JzO1xuICAgIE9iamVjdC5rZXlzKHRoaXMuX2luZGljYXRvcnMpLmZvckVhY2goa2V5ID0+IHtcbiAgICAgIGlmICh0aGlzLl9pbmRpY2F0b3JzW2tleV0udmFyaWFibGVzKVxuICAgICAgICBPYmplY3Qua2V5cyh0aGlzLl9pbmRpY2F0b3JzW2tleV0udmFyaWFibGVzKS5mb3JFYWNoKHZhcmlhYmxlID0+IHtcbiAgICAgICAgICB0aGlzLl9pbmRpY2F0b3JzW2tleV1bdmFyaWFibGVdID0gdGhpcy5faW5kaWNhdG9yc1trZXldLnZhcmlhYmxlc1tcbiAgICAgICAgICAgIHZhcmlhYmxlXG4gICAgICAgICAgXTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG4gICAgdGhpcy5fY29udGV4dC5sb2codGhpcy5faW5kaWNhdG9ycyk7XG4gIH1cblxuICBnZXQgaGFuZGxlQ2FuZGxlKCkge1xuICAgIHJldHVybiB0aGlzLl9oYW5kbGVDYW5kbGU7XG4gIH1cblxuICBfYWRkSW5kaWNhdG9yKG5hbWUsIGluZGljYXRvck5hbWUsIG9wdGlvbnMpIHtcbiAgICB0aGlzLl9pbmRpY2F0b3JzW25hbWVdID0ge307XG4gICAgdGhpcy5faW5kaWNhdG9yc1tuYW1lXS5uYW1lID0gbmFtZTtcbiAgICB0aGlzLl9pbmRpY2F0b3JzW25hbWVdLmluZGljYXRvck5hbWUgPSBpbmRpY2F0b3JOYW1lO1xuICAgIHRoaXMuX2luZGljYXRvcnNbbmFtZV0uZmlsZU5hbWUgPSBpbmRpY2F0b3JOYW1lO1xuICAgIHRoaXMuX2luZGljYXRvcnNbbmFtZV0udHlwZSA9IElORElDQVRPUlNfQkFTRTtcbiAgICB0aGlzLl9pbmRpY2F0b3JzW25hbWVdLm9wdGlvbnMgPSBvcHRpb25zO1xuICAgIHRoaXMuX2luZGljYXRvcnNbbmFtZV0udmFyaWFibGVzID0ge307XG4gIH1cblxuICBnZXQgYWRkSW5kaWNhdG9yKCkge1xuICAgIHJldHVybiB0aGlzLl9hZGRJbmRpY2F0b3I7XG4gIH1cblxuICBfYWRkVHVsaXBJbmRpY2F0b3IobmFtZSwgaW5kaWNhdG9yTmFtZSwgb3B0aW9ucykge1xuICAgIHRoaXMuX2FkZEluZGljYXRvcihuYW1lLCBpbmRpY2F0b3JOYW1lLCBvcHRpb25zKTtcbiAgICB0aGlzLl9pbmRpY2F0b3JzW25hbWVdLnR5cGUgPSBJTkRJQ0FUT1JTX1RVTElQO1xuICB9XG5cbiAgZ2V0IGFkZFR1bGlwSW5kaWNhdG9yKCkge1xuICAgIHJldHVybiB0aGlzLl9hZGRUdWxpcEluZGljYXRvcjtcbiAgfVxuXG4gIGdldCBpbml0aWFsaXplZCgpIHtcbiAgICByZXR1cm4gdGhpcy5faW5pdGlhbGl6ZWQ7XG4gIH1cblxuICBzZXQgaW5pdGlhbGl6ZWQodmFsdWUpIHtcbiAgICB0aGlzLl9pbml0aWFsaXplZCA9IHZhbHVlO1xuICB9XG5cbiAgZ2V0IHNldHRpbmdzKCkge1xuICAgIHJldHVybiB0aGlzLl9zZXR0aW5ncztcbiAgfVxuXG4gIGdldCBleGNoYW5nZSgpIHtcbiAgICByZXR1cm4gdGhpcy5fZXhjaGFuZ2U7XG4gIH1cblxuICBnZXQgYXNzZXQoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2Fzc2V0O1xuICB9XG5cbiAgZ2V0IGN1cnJlbmN5KCkge1xuICAgIHJldHVybiB0aGlzLl/RgXVycmVuY3k7XG4gIH1cblxuICBnZXQgdGltZWZyYW1lKCkge1xuICAgIHJldHVybiB0aGlzLl90aW1lZnJhbWU7XG4gIH1cblxuICBnZXQgY2FuZGxlKCkge1xuICAgIHJldHVybiB0aGlzLl9jYW5kbGU7XG4gIH1cblxuICBnZXQgaW5kaWNhdG9ycygpIHtcbiAgICByZXR1cm4gdGhpcy5faW5kaWNhdG9ycztcbiAgfVxuXG4gIGdldCBhZHZpY2UoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2FkdmljZTtcbiAgfVxuXG4gIGdldCBsb2coKSB7XG4gICAgcmV0dXJuIHRoaXMuX2xvZztcbiAgfVxuXG4gIGdldCBsb2dFdmVudCgpIHtcbiAgICByZXR1cm4gdGhpcy5fbG9nRXZlbnQ7XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgQmFzZVN0cmF0ZWd5O1xuIiwiaW1wb3J0IHtcbiAgU1RBVFVTX1NUQVJURUQsXG4gIFNUQVRVU19TVE9QUEVELFxuICBTVEFUVVNfQlVTWSxcbiAgU1RBVFVTX0VSUk9SXG59IGZyb20gXCJjcHpTdGF0ZVwiO1xuaW1wb3J0IEFkdmlzZXIgZnJvbSBcIi4vYWR2aXNlclwiO1xuaW1wb3J0IHsgcHVibGlzaEV2ZW50cyB9IGZyb20gXCIuLi9ldmVudGdyaWRcIjtcblxuLyoqXG4gKiDQntGB0L3QvtCy0L3QsNGPINC30LDQtNCw0YfQsCDRgdC+0LLQtdGC0L3QuNC60LBcbiAqXG4gKiBAcGFyYW0geyp9IGNvbnRleHRcbiAqIEBwYXJhbSB7Kn0gc3RhdGVcbiAqIEBwYXJhbSB7Kn0gY2FuZGxlXG4gKi9cbmFzeW5jIGZ1bmN0aW9uIGV4ZWN1dGUoY29udGV4dCwgc3RhdGUsIGNhbmRsZSkge1xuICBjb250ZXh0LmxvZyhcImV4ZWN1dGVcIik7XG4gIGxldCBhZHZpc2VyO1xuICB0cnkge1xuICAgIC8vINCh0L7Qt9C00LDQtdC8INGN0LrQt9C10LzQv9C70Y/RgCDQutC70LDRgdGB0LAgQWR2aXNlclxuICAgIGFkdmlzZXIgPSBuZXcgQWR2aXNlcihjb250ZXh0LCBzdGF0ZSk7XG4gICAgLy8g0JXRgdC70Lgg0LfQsNC00LDRh9CwINC+0YHRgtCw0L3QvtCy0LvQtdC90LBcbiAgICBpZiAoYWR2aXNlci5zdGF0dXMgPT09IFNUQVRVU19TVE9QUEVEIHx8IGFkdmlzZXIuc3RhdHVzID09PSBTVEFUVVNfRVJST1IpIHtcbiAgICAgIC8vINCh0L7RhdGA0LDQvdGP0LXQvCDRgdC+0YHRgtC+0Y/QvdC40LUg0Lgg0LfQsNCy0LXRgNGI0LDQtdC8INGA0LDQsdC+0YLRg1xuICAgICAgYWR2aXNlci5lbmQoYWR2aXNlci5zdGF0dXMpO1xuXG4gICAgICByZXR1cm4geyBpc1N1Y2Nlc3M6IHRydWUsIHRhc2tJZDogc3RhdGUudGFza0lkIH07XG4gICAgfVxuICAgIC8vINCV0YHQu9C4INC10YHRgtGMINC30LDQv9GA0L7RgSDQvdCwINC+0LHQvdC+0LLQu9C10L3QuNC1INC/0LDRgNCw0LzQtdGC0YDQvtCyXG4gICAgaWYgKGFkdmlzZXIudXBkYXRlUmVxdWVzdGVkKSB7XG4gICAgICAvLyDQntCx0L3QvtCy0LvRj9C10Lwg0L/QsNGA0LDQvNC10YLRgNGLXG4gICAgICBhZHZpc2VyLnNldFVwZGF0ZSgpO1xuICAgIH1cbiAgICAvLyDQo9GB0YLQsNC90LDQstC70LjQstCw0LXQvCDRgdGC0LDRgtGD0YEgXCLQl9Cw0L3Rj9GCXCJcbiAgICBhZHZpc2VyLnN0YXR1cyA9IFNUQVRVU19CVVNZO1xuICAgIGF3YWl0IGFkdmlzZXIuc2F2ZSgpO1xuICAgIC8vINCe0LHRgNCw0LHQvtGC0LrQsCDQvdC+0LLQvtC5INGB0LLQtdGH0Lgg0Lgg0LfQsNC/0YPRgdC6INGB0YLRgNCw0YLQtdCz0LjQuFxuICAgIGF3YWl0IGFkdmlzZXIuaGFuZGxlQ2FuZGxlKGNhbmRsZSk7XG4gICAgLy8g0JXRgdC70Lgg0LXRgdGC0Ywg0YXQvtGC0Y8g0LHRiyDQvtC00L3QviDRgdC+0LHRi9GC0LjQtSDQtNC70Y8g0L7RgtC/0YDQsNCy0LrQsFxuICAgIGlmIChhZHZpc2VyLmV2ZW50cy5sZW5ndGggPiAwKSB7XG4gICAgICAvLyDQntGC0L/RgNCw0LLQu9GP0LXQvFxuICAgICAgY29uc3QgcHVibGlzaEV2ZW50c1Jlc3VsdCA9IGF3YWl0IHB1Ymxpc2hFdmVudHMoXG4gICAgICAgIGNvbnRleHQsXG4gICAgICAgIFwic2lnbmFsc1wiLFxuICAgICAgICBhZHZpc2VyLmV2ZW50c1xuICAgICAgKTtcbiAgICAgIC8vINCV0YHQu9C4INC90LUg0YPQtNCw0LvQvtGB0Ywg0L7RgtC/0YDQsNCy0LjRgtGMINGB0L7QsdGL0YLQuNGPXG4gICAgICBpZiAoIXB1Ymxpc2hFdmVudHNSZXN1bHQuaXNTdWNjZXNzKSB7XG4gICAgICAgIHRocm93IHB1Ymxpc2hFdmVudHNSZXN1bHQ7XG4gICAgICB9XG4gICAgfVxuICAgIC8vINCX0LDQstC10YDRiNCw0LXQvCDRgNCw0LHQvtGC0YMg0Lgg0YHQvtGF0YDQsNC90Y/QtdC8INGB0YLQtdC50YJcbiAgICBhd2FpdCBhZHZpc2VyLmVuZChTVEFUVVNfU1RBUlRFRCk7XG4gICAgLy8g0JvQvtCz0LjRgNGD0LXQvCDQuNGC0LXRgNCw0YbQuNGOXG4gICAgYXdhaXQgYWR2aXNlci5sb2dFdmVudChhZHZpc2VyLmN1cnJlbnRTdGF0ZSk7XG4gICAgcmV0dXJuIHsgaXNTdWNjZXNzOiB0cnVlLCB0YXNrSWQ6IHN0YXRlLnRhc2tJZCB9O1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGNvbnRleHQubG9nLmVycm9yKGVycm9yLCBzdGF0ZS50YXNrSWQpO1xuICAgIC8vINCV0YHQu9C4INC10YHRgtGMINGN0LrQt9C10LzQv9C70Y/RgCDQutC70LDRgdGB0LBcbiAgICBpZiAoYWR2aXNlcikge1xuICAgICAgLy8g0KHQvtGF0YDQsNC90Y/QtdC8INC+0YjQuNCx0LrRgyDQsiDRgdGC0L7RgNC10LTQttC1INC4INC/0YDQvtC00L7Qu9C20LDQtdC8INGA0LDQsdC+0YLRg1xuICAgICAgYXdhaXQgYWR2aXNlci5lbmQoU1RBVFVTX1NUQVJURUQsIGVycm9yKTtcbiAgICB9XG4gICAgcmV0dXJuIHsgaXNTdWNjZXNzOiBmYWxzZSwgdGFza0lkOiBzdGF0ZS50YXNrSWQsIGVycm9yOiBlcnJvci5tZXNzYWdlIH07XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgZXhlY3V0ZTtcbiIsImltcG9ydCBkYXlqcyBmcm9tIFwiZGF5anNcIjtcbmltcG9ydCB7XG4gIEVSUk9SX0FEVklTRVJfRVZFTlQsXG4gIFRBU0tTX0FEVklTRVJfU1RBUlRFRF9FVkVOVCxcbiAgVEFTS1NfQURWSVNFUl9TVE9QUEVEX0VWRU5ULFxuICBUQVNLU19BRFZJU0VSX1VQREFURURfRVZFTlQsXG4gIENBTkRMRVNfSEFORExFRF9FVkVOVFxufSBmcm9tIFwiY3B6RXZlbnRUeXBlc1wiO1xuaW1wb3J0IHsgU1RBVFVTX1NUQVJURUQsIFNUQVRVU19TVE9QUEVELCBTVEFUVVNfQlVTWSB9IGZyb20gXCJjcHpTdGF0ZVwiO1xuaW1wb3J0IEFkdmlzZXIgZnJvbSBcIi4vYWR2aXNlclwiO1xuaW1wb3J0IHtcbiAgZ2V0QWR2aXNlckJ5S2V5LFxuICBnZXRBZHZpc2Vyc0J5U2x1ZyxcbiAgdXBkYXRlQWR2aXNlclN0YXRlLFxuICBzYXZlUGVuZGluZ0NhbmRsZXNcbn0gZnJvbSBcIi4uL3RhYmxlU3RvcmFnZVwiO1xuaW1wb3J0IHsgcHVibGlzaEV2ZW50cywgY3JlYXRlRXZlbnRzIH0gZnJvbSBcIi4uL2V2ZW50Z3JpZFwiO1xuaW1wb3J0IHsgY3JlYXRlU2x1ZyB9IGZyb20gXCIuLi90YWJsZVN0b3JhZ2UvdXRpbHNcIjtcbmltcG9ydCBleGVjdXRlIGZyb20gXCIuL2V4ZWN1dGVcIjtcbi8qKlxuICog0JfQsNC/0YPRgdC6INC90L7QstC+0LPQviDRgdC+0LLQtdGC0L3QuNC60LBcbiAqXG4gKiBAcGFyYW0geyp9IGNvbnRleHRcbiAqIEBwYXJhbSB7Kn0gZXZlbnREYXRhXG4gKi9cbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZVN0YXJ0KGNvbnRleHQsIGV2ZW50RGF0YSkge1xuICB0cnkge1xuICAgIC8vINCY0L3QuNGG0LjQsNC70LjQt9C40YDRg9C10Lwg0LrQu9Cw0YHRgSDRgdC+0LLQtdGC0L3QuNC60LBcbiAgICBjb25zdCBhZHZpc2VyID0gbmV3IEFkdmlzZXIoY29udGV4dCwgZXZlbnREYXRhKTtcbiAgICAvLyDQodC+0YXRgNCw0L3Rj9C10Lwg0YHQvtGB0YLQvtGP0L3QuNC1XG4gICAgYWR2aXNlci5lbmQoU1RBVFVTX1NUQVJURUQpO1xuICAgIC8vINCf0YPQsdC70LjQutGD0LXQvCDRgdC+0LHRi9GC0LjQtSAtINGD0YHQv9C10YVcbiAgICBhd2FpdCBwdWJsaXNoRXZlbnRzKFxuICAgICAgY29udGV4dCxcbiAgICAgIFwidGFza3NcIixcbiAgICAgIGNyZWF0ZUV2ZW50cyh7XG4gICAgICAgIHN1YmplY3Q6IGV2ZW50RGF0YS5ldmVudFN1YmplY3QsXG4gICAgICAgIGV2ZW50VHlwZTogVEFTS1NfQURWSVNFUl9TVEFSVEVEX0VWRU5ULmV2ZW50VHlwZSxcbiAgICAgICAgZGF0YToge1xuICAgICAgICAgIHRhc2tJZDogZXZlbnREYXRhLnRhc2tJZCxcbiAgICAgICAgICByb3dLZXk6IGV2ZW50RGF0YS50YXNrSWQsXG4gICAgICAgICAgcGFydGl0aW9uS2V5OiBjcmVhdGVTbHVnKFxuICAgICAgICAgICAgZXZlbnREYXRhLmV4Y2hhbmdlLFxuICAgICAgICAgICAgZXZlbnREYXRhLmFzc2V0LFxuICAgICAgICAgICAgZXZlbnREYXRhLmN1cnJlbmN5LFxuICAgICAgICAgICAgZXZlbnREYXRhLnRpbWVmcmFtZVxuICAgICAgICAgIClcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICApO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGNvbnRleHQubG9nLmVycm9yKFwiQWR2aXNlciBzdGFydGluZyBlcnJvcjpcIiwgZXJyb3IsIGV2ZW50RGF0YSk7XG4gICAgLy8g0J/Rg9Cx0LvQuNC60YPQtdC8INGB0L7QsdGL0YLQuNC1IC0g0L7RiNC40LHQutCwXG4gICAgYXdhaXQgcHVibGlzaEV2ZW50cyhcbiAgICAgIGNvbnRleHQsXG4gICAgICBcInRhc2tzXCIsXG4gICAgICBjcmVhdGVFdmVudHMoe1xuICAgICAgICBzdWJqZWN0OiBldmVudERhdGEuZXZlbnRTdWJqZWN0LFxuICAgICAgICBldmVudFR5cGU6IFRBU0tTX0FEVklTRVJfU1RBUlRFRF9FVkVOVC5ldmVudFR5cGUsXG4gICAgICAgIGRhdGE6IHtcbiAgICAgICAgICB0YXNrSWQ6IGV2ZW50RGF0YS50YXNrSWQsXG4gICAgICAgICAgZXJyb3JcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICApO1xuICB9XG59XG4vKipcbiAqINCe0YHRgtCw0L3QvtCy0LrQsCDRgdC+0LLQtdGC0L3QuNC60LBcbiAqXG4gKiBAcGFyYW0geyp9IGNvbnRleHRcbiAqIEBwYXJhbSB7Kn0gZXZlbnREYXRhXG4gKi9cbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZVN0b3AoY29udGV4dCwgZXZlbnREYXRhKSB7XG4gIHRyeSB7XG4gICAgLy8g0JjRidC10Lwg0YHQvtCy0LXRgtC90LjQutCwINC/0L4g0YPQvdC40LrQsNC70YzQvdC+0LzRgyDQutC70Y7Rh9GDXG4gICAgY29uc3QgZ2V0QWR2aXNlclJlc3VsdCA9IGF3YWl0IGdldEFkdmlzZXJCeUtleShjb250ZXh0LCB7XG4gICAgICByb3dLZXk6IGV2ZW50RGF0YS5yb3dLZXksXG4gICAgICBwYXJ0aXRpb25LZXk6IGV2ZW50RGF0YS5wYXJ0aXRpb25LZXlcbiAgICB9KTtcbiAgICAvLyDQldGB0LvQuCDQvtGI0LjQsdC60LAgLSDQs9C10L3QtdGA0LjRgNGD0LXQvCDQuNGB0LrQu9GO0YfQtdC90LjQtVxuICAgIGlmICghZ2V0QWR2aXNlclJlc3VsdC5pc1N1Y2Nlc3MpIHRocm93IGdldEFkdmlzZXJSZXN1bHQ7XG4gICAgLy8g0KLQtdC60YPRidC10LUg0YHQvtGB0YLQvtGP0L3QuNC1INGB0L7QstC10YLQvdC40LrQsFxuICAgIGNvbnN0IGFkdmlzZXJTdGF0ZSA9IGdldEFkdmlzZXJSZXN1bHQuZGF0YTtcbiAgICAvLyDQk9C10L3QtdGA0LjRgNGD0LXQvCDQvdC+0LLQvtC1INGB0L7RgdGC0L7Rj9C90LjQtVxuICAgIGNvbnN0IG5ld1N0YXRlID0ge1xuICAgICAgUm93S2V5OiBldmVudERhdGEucm93S2V5LFxuICAgICAgUGFydGl0aW9uS2V5OiBldmVudERhdGEucGFydGl0aW9uS2V5XG4gICAgfTtcbiAgICAvLyDQldGB0LvQuCDQt9Cw0L3Rj9GCXG4gICAgaWYgKGFkdmlzZXJTdGF0ZS5zdGF0dXMgPT09IFNUQVRVU19CVVNZKSB7XG4gICAgICAvLyDQodC+0LfQtNCw0LXQvCDQt9Cw0L/RgNC+0YEg0L3QsCDQt9Cw0LLQtdGA0YjQtdC90LjQtSDQv9GA0Lgg0YHQu9C10LTRg9GO0YnQtdC5INC40YLQtdGA0LDRhtC40LhcbiAgICAgIG5ld1N0YXRlLnN0b3BSZXF1ZXN0ZWQgPSB0cnVlO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyDQn9C+0LzQtdGH0LDQtdC8INC60LDQuiDQvtGB0YLQsNC90L7QstC70LXQvdC90YvQuVxuICAgICAgbmV3U3RhdGUuc3RhdHVzID0gU1RBVFVTX1NUT1BQRUQ7XG4gICAgICBuZXdTdGF0ZS5lbmRlZEF0ID0gZGF5anMoKS50b0pTT04oKTtcbiAgICB9XG4gICAgLy8g0J7QsdC90L7QstC70Y/QtdC8INGB0L7RgdGC0L7Rj9C90LjQtSDRgdC+0LLQtdGC0L3QuNC60LBcbiAgICBjb25zdCByZXN1bHQgPSBhd2FpdCB1cGRhdGVBZHZpc2VyU3RhdGUoY29udGV4dCwgbmV3U3RhdGUpO1xuICAgIC8vINCV0YHQu9C4INC+0YjQuNCx0LrQsCAtINCz0LXQvdC10YDQuNGA0YPQtdC8INC40YHQutC70Y7Rh9C10L3QuNC1XG4gICAgaWYgKCFyZXN1bHQuaXNTdWNjZXNzKVxuICAgICAgdGhyb3cgbmV3IEVycm9yKGBDYW4ndCB1cGRhdGUgc3RhdGVcXG4ke3Jlc3VsdC5lcnJvcn1gKTtcbiAgICAvLyDQn9GD0LHQu9C40LrRg9C10Lwg0YHQvtCx0YvRgtC40LUgLSDRg9GB0L/QtdGFXG4gICAgYXdhaXQgcHVibGlzaEV2ZW50cyhcbiAgICAgIGNvbnRleHQsXG4gICAgICBcInRhc2tzXCIsXG4gICAgICBjcmVhdGVFdmVudHMoe1xuICAgICAgICBzdWJqZWN0OiBldmVudERhdGEuZXZlbnRTdWJqZWN0LFxuICAgICAgICBldmVudFR5cGU6IFRBU0tTX0FEVklTRVJfU1RPUFBFRF9FVkVOVC5ldmVudFR5cGUsXG4gICAgICAgIGRhdGE6IHtcbiAgICAgICAgICB0YXNrSWQ6IGV2ZW50RGF0YS50YXNrSWRcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICApO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGNvbnRleHQubG9nLmVycm9yKFwiQWR2aXNlciBzdG9wcGluZyBlcnJvcjpcIiwgZXJyb3IsIGV2ZW50RGF0YSk7XG4gICAgLy8g0J/Rg9Cx0LvQuNC60YPQtdC8INGB0L7QsdGL0YLQuNC1IC0g0L7RiNC40LHQutCwXG4gICAgYXdhaXQgcHVibGlzaEV2ZW50cyhcbiAgICAgIGNvbnRleHQsXG4gICAgICBcInRhc2tzXCIsXG4gICAgICBjcmVhdGVFdmVudHMoe1xuICAgICAgICBzdWJqZWN0OiBldmVudERhdGEuZXZlbnRTdWJqZWN0LFxuICAgICAgICBldmVudFR5cGU6IFRBU0tTX0FEVklTRVJfU1RPUFBFRF9FVkVOVC5ldmVudFR5cGUsXG4gICAgICAgIGRhdGE6IHtcbiAgICAgICAgICB0YXNrSWQ6IGV2ZW50RGF0YS50YXNrSWQsXG4gICAgICAgICAgZXJyb3JcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICApO1xuICB9XG59XG4vKipcbiAqINCe0LHQvdC+0LLQu9C10L3QuNC1INC/0LDRgNCw0LzQtdGC0YDQvtCyINGB0L7QstC10YLQvdC40LrQsFxuICpcbiAqIEBwYXJhbSB7Kn0gY29udGV4dFxuICogQHBhcmFtIHsqfSBldmVudERhdGFcbiAqL1xuYXN5bmMgZnVuY3Rpb24gaGFuZGxlVXBkYXRlKGNvbnRleHQsIGV2ZW50RGF0YSkge1xuICB0cnkge1xuICAgIGNvbnN0IGdldENhbmRsZWJhdGNoZXJSZXN1bHQgPSBhd2FpdCBnZXRBZHZpc2VyQnlLZXkoY29udGV4dCwgZXZlbnREYXRhKTtcbiAgICBpZiAoZ2V0Q2FuZGxlYmF0Y2hlclJlc3VsdC5pc1N1Y2Nlc3MpIHtcbiAgICAgIGNvbnN0IGNhbmRsZWJhdGNoZXJTdGF0ZSA9IGdldENhbmRsZWJhdGNoZXJSZXN1bHQuZGF0YTtcbiAgICAgIGNvbnN0IG5ld1N0YXRlID0ge1xuICAgICAgICBSb3dLZXk6IGV2ZW50RGF0YS5yb3dLZXksXG4gICAgICAgIFBhcnRpdGlvbktleTogZXZlbnREYXRhLnBhcnRpdGlvbktleVxuICAgICAgfTtcbiAgICAgIC8vINCV0YHQu9C4INC30LDQvdGP0YJcbiAgICAgIGlmIChjYW5kbGViYXRjaGVyU3RhdGUuc3RhdHVzID09PSBTVEFUVVNfQlVTWSkge1xuICAgICAgICBuZXdTdGF0ZS51cGRhdGVSZXF1ZXN0ZWQgPSB7XG4gICAgICAgICAgZXZlbnRTdWJqZWN0OiBldmVudERhdGEuZXZlbnRTdWJqZWN0LFxuICAgICAgICAgIGRlYnVnOiBldmVudERhdGEuZGVidWcsXG4gICAgICAgICAgc2V0dGluZ3M6IGV2ZW50RGF0YS5zZXR0aW5ncyxcbiAgICAgICAgICByZXF1aXJlZEhpc3RvcnlDYWNoZTogZXZlbnREYXRhLnJlcXVpcmVkSGlzdG9yeUNhY2hlLFxuICAgICAgICAgIHJlcXVpcmVkSGlzdG9yeU1heEJhcnM6IGV2ZW50RGF0YS5yZXF1aXJlZEhpc3RvcnlNYXhCYXJzXG4gICAgICAgIH07XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBuZXdTdGF0ZS5ldmVudFN1YmplY3QgPSBldmVudERhdGEuZXZlbnRTdWJqZWN0O1xuICAgICAgICBuZXdTdGF0ZS5kZWJ1ZyA9IGV2ZW50RGF0YS5kZWJ1ZztcbiAgICAgICAgbmV3U3RhdGUuc2V0dGluZ3MgPSBldmVudERhdGEuc2V0dGluZ3M7XG4gICAgICAgIG5ld1N0YXRlLnJlcXVpcmVkSGlzdG9yeUNhY2hlID0gZXZlbnREYXRhLnJlcXVpcmVkSGlzdG9yeUNhY2hlO1xuICAgICAgICBuZXdTdGF0ZS5yZXF1aXJlZEhpc3RvcnlNYXhCYXJzID0gZXZlbnREYXRhLnJlcXVpcmVkSGlzdG9yeU1heEJhcnM7XG4gICAgICB9XG4gICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCB1cGRhdGVBZHZpc2VyU3RhdGUoY29udGV4dCwgbmV3U3RhdGUpO1xuICAgICAgaWYgKCFyZXN1bHQuaXNTdWNjZXNzKVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYENhbid0IHVwZGF0ZSBzdGF0ZVxcbiR7cmVzdWx0LmVycm9yfWApO1xuICAgICAgLy8g0J/Rg9Cx0LvQuNC60YPQtdC8INGB0L7QsdGL0YLQuNC1IC0g0YPRgdC/0LXRhVxuICAgICAgYXdhaXQgcHVibGlzaEV2ZW50cyhcbiAgICAgICAgY29udGV4dCxcbiAgICAgICAgXCJ0YXNrc1wiLFxuICAgICAgICBjcmVhdGVFdmVudHMoe1xuICAgICAgICAgIHN1YmplY3Q6IGV2ZW50RGF0YS5ldmVudFN1YmplY3QsXG4gICAgICAgICAgZXZlbnRUeXBlOiBUQVNLU19BRFZJU0VSX1VQREFURURfRVZFTlQuZXZlbnRUeXBlLFxuICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgIHRhc2tJZDogZXZlbnREYXRhLnRhc2tJZFxuICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICAgICk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IGdldENhbmRsZWJhdGNoZXJSZXN1bHQ7XG4gICAgfVxuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGNvbnRleHQubG9nLmVycm9yKFwiQWR2aXNlciB1cGRhdGluZyBlcnJvcjpcIiwgZXJyb3IsIGV2ZW50RGF0YSk7XG4gICAgLy8g0J/Rg9Cx0LvQuNC60YPQtdC8INGB0L7QsdGL0YLQuNC1IC0g0L7RiNC40LHQutCwXG4gICAgYXdhaXQgcHVibGlzaEV2ZW50cyhcbiAgICAgIGNvbnRleHQsXG4gICAgICBcInRhc2tzXCIsXG4gICAgICBjcmVhdGVFdmVudHMoe1xuICAgICAgICBzdWJqZWN0OiBldmVudERhdGEuZXZlbnRTdWJqZWN0LFxuICAgICAgICBldmVudFR5cGU6IFRBU0tTX0FEVklTRVJfVVBEQVRFRF9FVkVOVC5ldmVudFR5cGUsXG4gICAgICAgIGRhdGE6IHtcbiAgICAgICAgICB0YXNrSWQ6IGV2ZW50RGF0YS50YXNrSWQsXG4gICAgICAgICAgZXJyb3JcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICApO1xuICB9XG59XG5cbi8qKlxuICog0J7QsdGA0LDQsdC+0YLQutCwINC90L7QstC+0Lkg0YHQstC10YfQuFxuICpcbiAqIEBwYXJhbSB7Kn0gY29udGV4dFxuICogQHBhcmFtIHsqfSBjYW5kbGVcbiAqL1xuYXN5bmMgZnVuY3Rpb24gaGFuZGxlQ2FuZGxlKGNvbnRleHQsIGRhdGEpIHtcbiAgdHJ5IHtcbiAgICBjb25zdCB7IGNhbmRsZSB9ID0gZGF0YTtcbiAgICAvLyDQn9Cw0YDQsNC80LXRgtGA0Ysg0LfQsNC/0YDQvtGB0LAgLSDQsdC40YDQttCwICsg0LjQvdGB0YLRgNGD0LzQtdC90YIgKyDRgtCw0LnQvNGE0YDQtdC50LxcbiAgICBjb25zdCBzbHVnID0gY3JlYXRlU2x1ZyhcbiAgICAgIGNhbmRsZS5leGNoYW5nZSxcbiAgICAgIGNhbmRsZS5hc3NldCxcbiAgICAgIGNhbmRsZS5jdXJyZW5jeSxcbiAgICAgIGNhbmRsZS50aW1lZnJhbWVcbiAgICApO1xuICAgIC8vINCY0YnQtdC8INC/0L7QtNGF0L7QtNGP0YnQuNGFINGB0L7QstC10YLQvdC40LrQvtCyXG4gICAgY29uc3QgZ2V0QWR2aXNlcnNSZXN1bHQgPSBhd2FpdCBnZXRBZHZpc2Vyc0J5U2x1Zyhjb250ZXh0LCBzbHVnKTtcbiAgICAvLyDQldGB0LvQuCDQvtGI0LjQsdC60LAgLSDQs9C10L3QtdGA0LjRgNGD0LXQvCDQuNGB0LrQu9GO0YfQtdC90LjQtVxuICAgIGlmICghZ2V0QWR2aXNlcnNSZXN1bHQuaXNTdWNjZXNzKSB0aHJvdyBnZXRBZHZpc2Vyc1Jlc3VsdDtcbiAgICAvLyDQktGB0LUg0L/QvtC00YXQvtC00Y/RidC40LUg0YHQvtCy0LXRgtC90LjQutC4XG4gICAgY29uc3QgYWR2aXNlcnMgPSBnZXRBZHZpc2Vyc1Jlc3VsdC5kYXRhO1xuICAgIC8vINCk0LjQu9GM0YLRgNGD0LXQvCDRgtC+0LvRjNC60L4g0LTQvtGB0YLRg9C/0L3Ri9C1INGB0L7QstC10YLQvdC40LrQuFxuICAgIGNvbnN0IHN0YXJ0ZWRBZHZpc2VycyA9IGFkdmlzZXJzLmZpbHRlcihcbiAgICAgIGFkdmlzZXIgPT4gYWR2aXNlci5zdGF0dXMgPT09IFNUQVRVU19TVEFSVEVEXG4gICAgKTtcbiAgICAvLyDQpNC40LvRjNGC0YDRg9C10Lwg0YLQvtC70YzQutC+INC30LDQvdGP0YLRi9C1INGB0L7QstC10YLQvdC40LrQuFxuICAgIGNvbnN0IGJ1c3lBZHZpc2VycyA9IGFkdmlzZXJzLmZpbHRlcihcbiAgICAgIGFkdmlzZXIgPT4gYWR2aXNlci5zdGF0dXMgPT09IFNUQVRVU19CVVNZXG4gICAgKTtcbiAgICAvLyDQl9Cw0L/Rg9GB0LrQsNC10Lwg0L/QsNGA0LDQu9C70LXQu9GM0L3QviDQstGB0LXRhSDQtNC+0YHRgtGD0L/QvdGL0YUg0YHQvtCy0LXRgtC90LjQutC+0LIg0LIg0YDQsNCx0L7RgtGDXG4gICAgY29uc3QgYWR2aXNlckV4ZWN1dGlvblJlc3VsdHMgPSBhd2FpdCBQcm9taXNlLmFsbChcbiAgICAgIHN0YXJ0ZWRBZHZpc2Vycy5tYXAoYXN5bmMgc3RhdGUgPT4ge1xuICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBleGVjdXRlKGNvbnRleHQsIHN0YXRlLCBjYW5kbGUpO1xuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgfSlcbiAgICApO1xuXG4gICAgLy8g0JTQu9GPINC30LDQvdGP0YLRi9GFINGB0L7QstC10YLQvdC40LrQvtCyINC/0LDRgNCw0LvQu9C10LvRjNC90L4g0L3QsNC/0L7Qu9C90Y/QtdC8INGB0LLQtdGH0LDQvNC4INC+0YfQtdGA0LXQtNGMINC90LAg0LTQsNC70YzQvdC10LnRiNGD0Y4g0L7QsdGA0LDQsdC+0YLQutGDXG4gICAgY29uc3QgcGVuZGluZ0NhbmRsZXNSZXN1bHRzID0gYXdhaXQgUHJvbWlzZS5hbGwoXG4gICAgICBidXN5QWR2aXNlcnMubWFwKGFzeW5jIHN0YXRlID0+IHtcbiAgICAgICAgY29uc3QgbmV3UGVuZGluZ0NhbmRsZSA9IHtcbiAgICAgICAgICAuLi5jYW5kbGUsXG4gICAgICAgICAgdGFza0lkOiBzdGF0ZS50YXNrSWRcbiAgICAgICAgfTtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgc2F2ZVBlbmRpbmdDYW5kbGVzKGNvbnRleHQsIG5ld1BlbmRpbmdDYW5kbGUpO1xuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgfSlcbiAgICApO1xuXG4gICAgLy8g0J7RgtCx0LjRgNCw0LXQvCDQuNC3INGA0LXQt9GD0LvRjNGC0LDRgtCwINCy0YvQv9C+0LvQvdC10L3QuNGPINGC0L7Qu9GM0LrQviDRg9GB0L/QtdGI0L3Ri9C1XG4gICAgY29uc3Qgc3VjY2Vzc0FkdmlzZXJzID0gYWR2aXNlckV4ZWN1dGlvblJlc3VsdHNcbiAgICAgIC5maWx0ZXIocmVzdWx0ID0+IHJlc3VsdC5pc1N1Y2Nlc3MgPT09IHRydWUpXG4gICAgICAubWFwKHJlc3VsdCA9PiByZXN1bHQudGFza0lkKTtcbiAgICAvLyDQntGC0LHQuNGA0LDQtdC8INC40Lcg0YDQtdC30YPQu9GM0YLQsNGC0LAg0LLRi9C/0L7Qu9C90LXQvdC40Y8g0YLQvtC70YzQutC+INC90LUg0YPRgdC/0LXRiNC90YvQtVxuICAgIGNvbnN0IGVycm9yQWR2aXNlcnMgPSBhZHZpc2VyRXhlY3V0aW9uUmVzdWx0c1xuICAgICAgLmZpbHRlcihyZXN1bHQgPT4gcmVzdWx0LmlzU3VjY2VzcyA9PT0gZmFsc2UpXG4gICAgICAubWFwKHJlc3VsdCA9PiAoeyB0YXNrSWQ6IHJlc3VsdC50YXNrSWQsIGVycm9yOiByZXN1bHQuZXJyb3IgfSkpO1xuICAgIC8vIFRPRE86INC+0LHRgNCw0LHQvtGC0LDRgtGMINC+0YjQuNCx0LrQuCDQstGB0YLQsNCy0LrQuCDQsiDRgdGC0L7RgNC10LTQtiDQuCDQvtGC0L/RgNCw0LLQuNGC0Ywg0YHQstC10YfQuCDQsiDQvtGH0LXRgNC10LTRjFxuICAgIC8vINCe0YLQsdC40YDQsNC10Lwg0LjQtyDRgNC10LfRg9C70YzRgtCw0YLQsCDQstGL0L/QvtC70L3QtdC90LjRjyDRgtC+0LvRjNC60L4g0YPRgdC/0LXRiNC90YvQtVxuICAgIGNvbnN0IHN1Y2Nlc3NQZW5kaW5nQWR2aXNlcnMgPSBwZW5kaW5nQ2FuZGxlc1Jlc3VsdHNcbiAgICAgIC5maWx0ZXIocmVzdWx0ID0+IHJlc3VsdC5pc1N1Y2Nlc3MgPT09IHRydWUpXG4gICAgICAubWFwKHJlc3VsdCA9PiByZXN1bHQudGFza0lkKTtcbiAgICAvLyDQntGC0LHQuNGA0LDQtdC8INC40Lcg0YDQtdC30YPQu9GM0YLQsNGC0LAg0LLRi9C/0L7Qu9C90LXQvdC40Y8g0YLQvtC70YzQutC+INC90LUg0YPRgdC/0LXRiNC90YvQtVxuICAgIGNvbnN0IGVycm9yUGVuZGluZ0FkdmlzZXJzID0gcGVuZGluZ0NhbmRsZXNSZXN1bHRzXG4gICAgICAuZmlsdGVyKHJlc3VsdCA9PiByZXN1bHQuaXNTdWNjZXNzID09PSBmYWxzZSlcbiAgICAgIC5tYXAocmVzdWx0ID0+ICh7IHRhc2tJZDogcmVzdWx0LnRhc2tJZCwgZXJyb3I6IHJlc3VsdC5lcnJvciB9KSk7XG5cbiAgICAvLyDQn9GD0LHQu9C40LrRg9C10Lwg0YHQvtCx0YvRgtC40LUgLSDRg9GB0L/QtdGFXG4gICAgYXdhaXQgcHVibGlzaEV2ZW50cyhcbiAgICAgIGNvbnRleHQsXG4gICAgICBcInRhc2tzXCIsXG4gICAgICBjcmVhdGVFdmVudHMoe1xuICAgICAgICBzdWJqZWN0OiBgJHtjYW5kbGUuZXhjaGFuZ2V9LyR7Y2FuZGxlLmFzc2V0fS8ke2NhbmRsZS5jdXJyZW5jeX0vJHtcbiAgICAgICAgICBjYW5kbGUudGltZWZyYW1lXG4gICAgICAgIH1gLFxuICAgICAgICBldmVudFR5cGU6IENBTkRMRVNfSEFORExFRF9FVkVOVC5ldmVudFR5cGUsXG4gICAgICAgIGRhdGE6IHtcbiAgICAgICAgICBjYW5kbGVJZDogY2FuZGxlLmNhbmRsZUlkLFxuICAgICAgICAgIHN1Y2Nlc3NBZHZpc2VycyxcbiAgICAgICAgICBlcnJvckFkdmlzZXJzLFxuICAgICAgICAgIHN1Y2Nlc3NQZW5kaW5nQWR2aXNlcnMsXG4gICAgICAgICAgZXJyb3JQZW5kaW5nQWR2aXNlcnNcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICApO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGNvbnRleHQubG9nLmVycm9yKFwiSGFuZGxlIGNhbmRsZSBlcnJvcjpcIiwgZXJyb3IsIGRhdGEpO1xuICAgIC8vINCf0YPQsdC70LjQutGD0LXQvCDRgdC+0LHRi9GC0LjQtSAtINC+0YjQuNCx0LrQsFxuICAgIGF3YWl0IHB1Ymxpc2hFdmVudHMoXG4gICAgICBjb250ZXh0LFxuICAgICAgXCJsb2dcIixcbiAgICAgIGNyZWF0ZUV2ZW50cyh7XG4gICAgICAgIHN1YmplY3Q6IFwiQ2FuZGxlXCIsXG4gICAgICAgIGV2ZW50VHlwZTogRVJST1JfQURWSVNFUl9FVkVOVC5ldmVudFR5cGUsXG4gICAgICAgIGRhdGE6IHtcbiAgICAgICAgICBjYW5kbGVJZDogZGF0YS5jYW5kbGUuaWQsXG4gICAgICAgICAgZXJyb3JcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICApO1xuICB9XG59XG5cbmV4cG9ydCB7IGhhbmRsZVN0YXJ0LCBoYW5kbGVTdG9wLCBoYW5kbGVVcGRhdGUsIGhhbmRsZUNhbmRsZSB9O1xuIiwiLypcbiAqINCf0YPQsdC70LjQutCw0YbQuNGPINGB0LLQtdGH0LXQuSDQsiDRgtC+0L/QuNC6IEV2ZW50R3JpZCDQsiDRgNCw0LfQu9C40YfQvdGL0YUg0YLQsNC50LzRhNGA0LXQvNCw0YVcbiAqL1xuaW1wb3J0IG1zUmVzdEF6dXJlIGZyb20gXCJtcy1yZXN0LWF6dXJlXCI7XG5pbXBvcnQgRXZlbnRHcmlkIGZyb20gXCJhenVyZS1ldmVudGdyaWRcIjtcbmltcG9ydCB1cmwgZnJvbSBcInVybFwiO1xuaW1wb3J0IHsgdjQgYXMgdXVpZCB9IGZyb20gXCJ1dWlkXCI7XG5pbXBvcnQgeyBBRFZJU0VSX1NFUlZJQ0UgfSBmcm9tIFwiY3B6U2VydmljZXNcIjtcblxuZnVuY3Rpb24gY3JlYXRlQ2xpZW50KGtleSkge1xuICByZXR1cm4gbmV3IEV2ZW50R3JpZChuZXcgbXNSZXN0QXp1cmUuVG9waWNDcmVkZW50aWFscyhrZXkpKTtcbn1cblxuZnVuY3Rpb24gZ2V0SG9zdChlbmRwb2ludCkge1xuICByZXR1cm4gdXJsLnBhcnNlKGVuZHBvaW50LCB0cnVlKS5ob3N0O1xufVxuXG5jb25zdCB0b3BpY3MgPSB7XG4gIHRhc2tzOiB7XG4gICAgY2xpZW50OiBjcmVhdGVDbGllbnQocHJvY2Vzcy5lbnYuRUdfVEFTS1NfS0VZIHx8IHByb2Nlc3MuZW52LkVHX1RFU1RfS0VZKSxcbiAgICBob3N0OiBnZXRIb3N0KHByb2Nlc3MuZW52LkVHX1RBU0tTX0VORFBPSU5UIHx8IHByb2Nlc3MuZW52LkVHX1RFU1RfRU5EUE9JTlQpXG4gIH0sXG4gIGNhbmRsZXM6IHtcbiAgICBjbGllbnQ6IGNyZWF0ZUNsaWVudChwcm9jZXNzLmVudi5FR19DQU5ETEVTX0tFWSB8fCBwcm9jZXNzLmVudi5FR19URVNUX0tFWSksXG4gICAgaG9zdDogZ2V0SG9zdChcbiAgICAgIHByb2Nlc3MuZW52LkVHX0NBTkRMRVNfRU5EUE9JTlQgfHwgcHJvY2Vzcy5lbnYuRUdfVEVTVF9FTkRQT0lOVFxuICAgIClcbiAgfSxcbiAgc2lnbmFsczoge1xuICAgIGNsaWVudDogY3JlYXRlQ2xpZW50KHByb2Nlc3MuZW52LkVHX1NJR05BTFNfS0VZIHx8IHByb2Nlc3MuZW52LkVHX1RFU1RfS0VZKSxcbiAgICBob3N0OiBnZXRIb3N0KFxuICAgICAgcHJvY2Vzcy5lbnYuRUdfU0lHTkFMU19FTkRQT0lOVCB8fCBwcm9jZXNzLmVudi5FR19URVNUX0VORFBPSU5UXG4gICAgKVxuICB9LFxuICBsb2c6IHtcbiAgICBjbGllbnQ6IGNyZWF0ZUNsaWVudChwcm9jZXNzLmVudi5FR19MT0dfS0VZIHx8IHByb2Nlc3MuZW52LkVHX1RFU1RfS0VZKSxcbiAgICBob3N0OiBnZXRIb3N0KHByb2Nlc3MuZW52LkVHX0xPR19FTkRQT0lOVCB8fCBwcm9jZXNzLmVudi5FR19URVNUX0VORFBPSU5UKVxuICB9XG59O1xuXG5mdW5jdGlvbiBjcmVhdGVFdmVudHMoZXZlbnREYXRhKSB7XG4gIGNvbnN0IGV2ZW50cyA9IFtdO1xuICBjb25zdCBkYXRhID0geyBzZXJ2aWNlOiBBRFZJU0VSX1NFUlZJQ0UsIC4uLmV2ZW50RGF0YS5kYXRhIH07XG4gIGNvbnN0IG5ld0V2ZW50ID0ge1xuICAgIGlkOiB1dWlkKCksXG4gICAgZGF0YVZlcnNpb246IFwiMS4wXCIsXG4gICAgZXZlbnRUaW1lOiBuZXcgRGF0ZSgpLFxuICAgIHN1YmplY3Q6IGV2ZW50RGF0YS5zdWJqZWN0LFxuICAgIGV2ZW50VHlwZTogZXZlbnREYXRhLmV2ZW50VHlwZSxcbiAgICBkYXRhXG4gIH07XG4gIGV2ZW50cy5wdXNoKG5ld0V2ZW50KTtcbiAgcmV0dXJuIGV2ZW50cztcbn1cblxuYXN5bmMgZnVuY3Rpb24gcHVibGlzaEV2ZW50cyhjb250ZXh0LCB0b3BpYywgZXZlbnRzKSB7XG4gIHRyeSB7XG4gICAgY29uc3QgeyBjbGllbnQsIGhvc3QgfSA9IHRvcGljc1t0b3BpY107XG4gICAgYXdhaXQgY2xpZW50LnB1Ymxpc2hFdmVudHMoaG9zdCwgZXZlbnRzKTtcblxuICAgIHJldHVybiB7IGlzU3VjY2VzczogdHJ1ZSB9O1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGNvbnRleHQubG9nLmVycm9yKGVycm9yKTtcbiAgICByZXR1cm4geyBpc1N1Y2Nlc3M6IGZhbHNlLCB0b3BpYywgZXZlbnRzLCBlcnJvciB9O1xuICB9XG59XG5cbmV4cG9ydCB7IHB1Ymxpc2hFdmVudHMsIGNyZWF0ZUV2ZW50cyB9O1xuIiwiaW1wb3J0IHtcbiAgU1VCX1ZBTElEQVRJT05fRVZFTlQsXG4gIFRBU0tTX0FEVklTRVJfU1RBUlRfRVZFTlQsXG4gIFRBU0tTX0FEVklTRVJfU1RPUF9FVkVOVCxcbiAgVEFTS1NfQURWSVNFUl9VUERBVEVfRVZFTlRcbn0gZnJvbSBcImNwekV2ZW50VHlwZXNcIjtcbmltcG9ydCB7IGhhbmRsZVN0YXJ0LCBoYW5kbGVTdG9wLCBoYW5kbGVVcGRhdGUgfSBmcm9tIFwiLi4vYWR2aXNlci9oYW5kbGVFdmVudHNcIjtcblxuZnVuY3Rpb24gZXZlbnRIYW5kbGVyKGNvbnRleHQsIHJlcSkge1xuICBjb25zdCBwYXJzZWRSZXEgPSBKU09OLnBhcnNlKHJlcS5yYXdCb2R5KTtcbiAgY29udGV4dC5sb2cuaW5mbyhcbiAgICBgQ1BaIEFkdmlzZXIgcHJvY2Vzc2VkIGEgcmVxdWVzdC4ke0pTT04uc3RyaW5naWZ5KHBhcnNlZFJlcSl9YFxuICApO1xuICAvLyBUT0RPOiBTRU5ERVIgRU5EUE9JTlQgVkFMSURBVElPTlxuICAvLyBjaGVjayByZXEub3JpZ2luYWxVcmxcbiAgcGFyc2VkUmVxLmZvckVhY2goZXZlbnRHcmlkRXZlbnQgPT4ge1xuICAgIGNvbnN0IGV2ZW50RGF0YSA9IGV2ZW50R3JpZEV2ZW50LmRhdGE7XG4gICAgY29uc3QgZXZlbnRTdWJqZWN0ID0gZXZlbnRHcmlkRXZlbnQuc3ViamVjdDtcbiAgICBzd2l0Y2ggKGV2ZW50R3JpZEV2ZW50LmV2ZW50VHlwZSkge1xuICAgICAgY2FzZSBTVUJfVkFMSURBVElPTl9FVkVOVC5ldmVudFR5cGU6IHtcbiAgICAgICAgY29udGV4dC5sb2cud2FybihcbiAgICAgICAgICBgR290IFN1YnNjcmlwdGlvblZhbGlkYXRpb24gZXZlbnQgZGF0YSwgdmFsaWRhdGlvbkNvZGU6ICR7XG4gICAgICAgICAgICBldmVudERhdGEudmFsaWRhdGlvbkNvZGVcbiAgICAgICAgICB9LCB0b3BpYzogJHtldmVudEdyaWRFdmVudC50b3BpY31gXG4gICAgICAgICk7XG4gICAgICAgIGNvbnRleHQucmVzID0ge1xuICAgICAgICAgIHN0YXR1czogMjAwLFxuICAgICAgICAgIGJvZHk6IHtcbiAgICAgICAgICAgIHZhbGlkYXRpb25SZXNwb25zZTogZXZlbnREYXRhLnZhbGlkYXRpb25Db2RlXG4gICAgICAgICAgfSxcbiAgICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgICBcIkNvbnRlbnQtVHlwZVwiOiBcImFwcGxpY2F0aW9uL2pzb25cIlxuICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgICBjYXNlIFRBU0tTX0FEVklTRVJfU1RBUlRfRVZFTlQuZXZlbnRUeXBlOiB7XG4gICAgICAgIGNvbnRleHQubG9nLmluZm8oXG4gICAgICAgICAgYEdvdCAke2V2ZW50R3JpZEV2ZW50LmV2ZW50VHlwZX0gZXZlbnQgZGF0YSAke0pTT04uc3RyaW5naWZ5KFxuICAgICAgICAgICAgZXZlbnREYXRhXG4gICAgICAgICAgKX1gXG4gICAgICAgICk7XG4gICAgICAgIGhhbmRsZVN0YXJ0KGNvbnRleHQsIHsgZXZlbnRTdWJqZWN0LCAuLi5ldmVudERhdGEgfSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgICAgY2FzZSBUQVNLU19BRFZJU0VSX1NUT1BfRVZFTlQuZXZlbnRUeXBlOiB7XG4gICAgICAgIGNvbnRleHQubG9nLmluZm8oXG4gICAgICAgICAgYEdvdCAke2V2ZW50R3JpZEV2ZW50LmV2ZW50VHlwZX0gZXZlbnQgZGF0YSAke0pTT04uc3RyaW5naWZ5KFxuICAgICAgICAgICAgZXZlbnREYXRhXG4gICAgICAgICAgKX1gXG4gICAgICAgICk7XG4gICAgICAgIGhhbmRsZVN0b3AoY29udGV4dCwgeyBldmVudFN1YmplY3QsIC4uLmV2ZW50RGF0YSB9KTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgICBjYXNlIFRBU0tTX0FEVklTRVJfVVBEQVRFX0VWRU5ULmV2ZW50VHlwZToge1xuICAgICAgICBjb250ZXh0LmxvZy5pbmZvKFxuICAgICAgICAgIGBHb3QgJHtldmVudEdyaWRFdmVudC5ldmVudFR5cGV9IGV2ZW50IGRhdGEgJHtKU09OLnN0cmluZ2lmeShcbiAgICAgICAgICAgIGV2ZW50RGF0YVxuICAgICAgICAgICl9YFxuICAgICAgICApO1xuICAgICAgICBoYW5kbGVVcGRhdGUoY29udGV4dCwgeyBldmVudFN1YmplY3QsIC4uLmV2ZW50RGF0YSB9KTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgICBkZWZhdWx0OiB7XG4gICAgICAgIGNvbnRleHQubG9nLmVycm9yKGBVbmtub3duIEV2ZW50IFR5cGU6ICR7ZXZlbnRHcmlkRXZlbnQuZXZlbnRUeXBlfWApO1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG4gIGNvbnRleHQucmVzID0ge1xuICAgIHN0YXR1czogMjAwXG4gIH07XG4gIGNvbnRleHQuZG9uZSgpO1xufVxuXG5leHBvcnQgZGVmYXVsdCBldmVudEhhbmRsZXI7XG4iLCJ2YXIgbWFwID0ge1xuXHRcIi4vRU1BXCI6IFwiLi9zcmMvaW5kaWNhdG9ycy9FTUEuanNcIixcblx0XCIuL0VNQS5qc1wiOiBcIi4vc3JjL2luZGljYXRvcnMvRU1BLmpzXCJcbn07XG5cblxuZnVuY3Rpb24gd2VicGFja0NvbnRleHQocmVxKSB7XG5cdHZhciBpZCA9IHdlYnBhY2tDb250ZXh0UmVzb2x2ZShyZXEpO1xuXHRyZXR1cm4gX193ZWJwYWNrX3JlcXVpcmVfXyhpZCk7XG59XG5mdW5jdGlvbiB3ZWJwYWNrQ29udGV4dFJlc29sdmUocmVxKSB7XG5cdHZhciBpZCA9IG1hcFtyZXFdO1xuXHRpZighKGlkICsgMSkpIHsgLy8gY2hlY2sgZm9yIG51bWJlciBvciBzdHJpbmdcblx0XHR2YXIgZSA9IG5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIgKyByZXEgKyBcIidcIik7XG5cdFx0ZS5jb2RlID0gJ01PRFVMRV9OT1RfRk9VTkQnO1xuXHRcdHRocm93IGU7XG5cdH1cblx0cmV0dXJuIGlkO1xufVxud2VicGFja0NvbnRleHQua2V5cyA9IGZ1bmN0aW9uIHdlYnBhY2tDb250ZXh0S2V5cygpIHtcblx0cmV0dXJuIE9iamVjdC5rZXlzKG1hcCk7XG59O1xud2VicGFja0NvbnRleHQucmVzb2x2ZSA9IHdlYnBhY2tDb250ZXh0UmVzb2x2ZTtcbm1vZHVsZS5leHBvcnRzID0gd2VicGFja0NvbnRleHQ7XG53ZWJwYWNrQ29udGV4dC5pZCA9IFwiLi9zcmMvaW5kaWNhdG9ycyBzeW5jIHJlY3Vyc2l2ZSBeXFxcXC5cXFxcLy4qJFwiOyIsImNvbnN0IEVNQSA9IHtcbiAgaW5pdCgpIHtcbiAgICB0aGlzLmlucHV0ID0gXCJwcmljZVwiO1xuICAgIHRoaXMud2VpZ2h0ID0gdGhpcy5vcHRpb25zLndlaWdodDtcbiAgICB0aGlzLnJlc3VsdCA9IGZhbHNlO1xuICAgIHRoaXMuYWdlID0gMDtcbiAgfSxcbiAgY2FsYygpIHtcbiAgICB0aGlzLmxvZyhcImNhbGNcIik7XG4gICAgdGhpcy5wcmljZSA9IHRoaXMuY2FuZGxlLmNsb3NlO1xuICAgIC8vIFRoZSBmaXJzdCB0aW1lIHdlIGNhbid0IGNhbGN1bGF0ZSBiYXNlZCBvbiBwcmV2aW91c1xuICAgIC8vIGVtYSwgYmVjYXVzZSB3ZSBoYXZlbid0IGNhbGN1bGF0ZWQgYW55IHlldC5cbiAgICBpZiAodGhpcy5yZXN1bHQgPT09IGZhbHNlKSB0aGlzLnJlc3VsdCA9IHRoaXMucHJpY2U7XG5cbiAgICB0aGlzLmFnZSArPSAxO1xuICAgIC8vIHdlaWdodCBmYWN0b3JcbiAgICBjb25zdCBrID0gMiAvICh0aGlzLndlaWdodCArIDEpO1xuXG4gICAgLy8geWVzdGVyZGF5XG4gICAgY29uc3QgeSA9IHRoaXMucmVzdWx0O1xuXG4gICAgLy8gY2FsY3VsYXRpb25cbiAgICB0aGlzLnJlc3VsdCA9IHRoaXMucHJpY2UgKiBrICsgeSAqICgxIC0gayk7XG4gICAgdGhpcy5sb2codGhpcy5yZXN1bHQpO1xuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEVNQTtcbiIsIi8qIGZyb20gaHR0cHM6Ly9naXRodWIuY29tL2Fza21pa2UvZ2Vra28vICovXG5pbXBvcnQgdHVsaW5kIGZyb20gXCJ0dWxpbmRcIjtcblxuZnVuY3Rpb24gaXNOdW1lcmljKG9iaikge1xuICByZXR1cm4gIUFycmF5LmlzQXJyYXkob2JqKSAmJiBvYmogLSBwYXJzZUZsb2F0KG9iaikgKyAxID49IDA7XG59XG5jb25zdCBtZXRob2RzID0ge307XG4vLyBXcmFwcGVyIHRoYXQgZXhlY3V0ZXMgYSB0dWxpcCBpbmRpY2F0b3JcbmFzeW5jIGZ1bmN0aW9uIGV4ZWN1dGUocGFyYW1zKSB7XG4gIHRyeSB7XG4gICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgcGFyYW1zLmluZGljYXRvci5pbmRpY2F0b3IoXG4gICAgICBwYXJhbXMuaW5wdXRzLFxuICAgICAgcGFyYW1zLm9wdGlvbnNcbiAgICApO1xuICAgIGNvbnN0IHJlc3VsdHMgPSB7fTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHBhcmFtcy5yZXN1bHRzLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICBpZiAoQXJyYXkuaXNBcnJheShyZXN1bHRbaV0pKSB7XG4gICAgICAgIGNvbnN0IGFyciA9IHJlc3VsdFtpXTtcbiAgICAgICAgcmVzdWx0c1twYXJhbXMucmVzdWx0c1tpXV0gPSBhcnJbYXJyLmxlbmd0aCAtIDFdO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmVzdWx0c1twYXJhbXMucmVzdWx0c1tpXV0gPSByZXN1bHRbaV07XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXN1bHRzO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIHRocm93IGVycm9yO1xuICB9XG59XG5cbi8vIEhlbHBlciB0aGF0IG1ha2VzIHN1cmUgYWxsIHJlcXVpcmVkIHBhcmFtZXRlcnNcbi8vIGZvciBhIHNwZWNpZmljIHRhbGliIGluZGljYXRvciBhcmUgcHJlc2VudC5cbmNvbnN0IHZlcmlmeVBhcmFtcyA9IChtZXRob2ROYW1lLCBwYXJhbXMpID0+IHtcbiAgY29uc3QgcmVxdWlyZWRQYXJhbXMgPSBtZXRob2RzW21ldGhvZE5hbWVdLnJlcXVpcmVzO1xuXG4gIHJlcXVpcmVkUGFyYW1zLmZvckVhY2gocGFyYW1OYW1lID0+IHtcbiAgICBpZiAoIU9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChwYXJhbXMsIHBhcmFtTmFtZSkpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgYENhbid0IGNvbmZpZ3VyZSB0dWxpcCAke21ldGhvZE5hbWV9IHJlcXVpcmVzICR7cGFyYW1OYW1lfS5gXG4gICAgICApO1xuICAgIH1cblxuICAgIGNvbnN0IHZhbCA9IHBhcmFtc1twYXJhbU5hbWVdO1xuXG4gICAgaWYgKCFpc051bWVyaWModmFsKSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICBgQ2FuJ3QgY29uZmlndXJlIHR1bGlwICR7bWV0aG9kTmFtZX0gLSAke3BhcmFtTmFtZX0gbmVlZHMgdG8gYmUgYSBudW1iZXJgXG4gICAgICApO1xuICAgIH1cbiAgfSk7XG59O1xuXG5tZXRob2RzLmFkID0ge1xuICByZXF1aXJlczogW10sXG4gIGNyZWF0ZTogcGFyYW1zID0+IHtcbiAgICB2ZXJpZnlQYXJhbXMoXCJhZFwiLCBwYXJhbXMpO1xuXG4gICAgcmV0dXJuIGRhdGEgPT5cbiAgICAgIGV4ZWN1dGUoe1xuICAgICAgICBpbmRpY2F0b3I6IHR1bGluZC5pbmRpY2F0b3JzLmFkLFxuICAgICAgICBpbnB1dHM6IFtkYXRhLmhpZ2gsIGRhdGEubG93LCBkYXRhLmNsb3NlLCBkYXRhLnZvbHVtZV0sXG4gICAgICAgIG9wdGlvbnM6IFtdLFxuICAgICAgICByZXN1bHRzOiBbXCJyZXN1bHRcIl1cbiAgICAgIH0pO1xuICB9XG59O1xuXG5tZXRob2RzLmFkb3NjID0ge1xuICByZXF1aXJlczogW1wib3B0SW5GYXN0UGVyaW9kXCIsIFwib3B0SW5TbG93UGVyaW9kXCJdLFxuICBjcmVhdGU6IHBhcmFtcyA9PiB7XG4gICAgdmVyaWZ5UGFyYW1zKFwiYWRvc2NcIiwgcGFyYW1zKTtcblxuICAgIHJldHVybiBkYXRhID0+XG4gICAgICBleGVjdXRlKHtcbiAgICAgICAgaW5kaWNhdG9yOiB0dWxpbmQuaW5kaWNhdG9ycy5hZG9zYyxcbiAgICAgICAgaW5wdXRzOiBbZGF0YS5oaWdoLCBkYXRhLmxvdywgZGF0YS5jbG9zZSwgZGF0YS52b2x1bWVdLFxuICAgICAgICBvcHRpb25zOiBbcGFyYW1zLm9wdEluRmFzdFBlcmlvZCwgcGFyYW1zLm9wdEluU2xvd1BlcmlvZF0sXG4gICAgICAgIHJlc3VsdHM6IFtcInJlc3VsdFwiXVxuICAgICAgfSk7XG4gIH1cbn07XG5cbm1ldGhvZHMuYWR4ID0ge1xuICByZXF1aXJlczogW1wib3B0SW5UaW1lUGVyaW9kXCJdLFxuICBjcmVhdGU6IHBhcmFtcyA9PiB7XG4gICAgdmVyaWZ5UGFyYW1zKFwiYWR4XCIsIHBhcmFtcyk7XG5cbiAgICByZXR1cm4gZGF0YSA9PlxuICAgICAgZXhlY3V0ZSh7XG4gICAgICAgIGluZGljYXRvcjogdHVsaW5kLmluZGljYXRvcnMuYWR4LFxuICAgICAgICBpbnB1dHM6IFtkYXRhLmhpZ2gsIGRhdGEubG93LCBkYXRhLmNsb3NlXSxcbiAgICAgICAgb3B0aW9uczogW3BhcmFtcy5vcHRJblRpbWVQZXJpb2RdLFxuICAgICAgICByZXN1bHRzOiBbXCJyZXN1bHRcIl1cbiAgICAgIH0pO1xuICB9XG59O1xuXG5tZXRob2RzLmFkeHIgPSB7XG4gIHJlcXVpcmVzOiBbXCJvcHRJblRpbWVQZXJpb2RcIl0sXG4gIGNyZWF0ZTogcGFyYW1zID0+IHtcbiAgICB2ZXJpZnlQYXJhbXMoXCJhZHhyXCIsIHBhcmFtcyk7XG5cbiAgICByZXR1cm4gZGF0YSA9PlxuICAgICAgZXhlY3V0ZSh7XG4gICAgICAgIGluZGljYXRvcjogdHVsaW5kLmluZGljYXRvcnMuYWR4cixcbiAgICAgICAgaW5wdXRzOiBbZGF0YS5oaWdoLCBkYXRhLmxvdywgZGF0YS5jbG9zZV0sXG4gICAgICAgIG9wdGlvbnM6IFtwYXJhbXMub3B0SW5UaW1lUGVyaW9kXSxcbiAgICAgICAgcmVzdWx0czogW1wicmVzdWx0XCJdXG4gICAgICB9KTtcbiAgfVxufTtcblxubWV0aG9kcy5hbyA9IHtcbiAgcmVxdWlyZXM6IFtdLFxuICBjcmVhdGU6IHBhcmFtcyA9PiB7XG4gICAgdmVyaWZ5UGFyYW1zKFwiYW9cIiwgcGFyYW1zKTtcblxuICAgIHJldHVybiBkYXRhID0+XG4gICAgICBleGVjdXRlKHtcbiAgICAgICAgaW5kaWNhdG9yOiB0dWxpbmQuaW5kaWNhdG9ycy5hbyxcbiAgICAgICAgaW5wdXRzOiBbZGF0YS5oaWdoLCBkYXRhLmxvd10sXG4gICAgICAgIG9wdGlvbnM6IFtdLFxuICAgICAgICByZXN1bHRzOiBbXCJyZXN1bHRcIl1cbiAgICAgIH0pO1xuICB9XG59O1xuXG5tZXRob2RzLmFwbyA9IHtcbiAgcmVxdWlyZXM6IFtcIm9wdEluRmFzdFBlcmlvZFwiLCBcIm9wdEluU2xvd1BlcmlvZFwiXSxcbiAgY3JlYXRlOiBwYXJhbXMgPT4ge1xuICAgIHZlcmlmeVBhcmFtcyhcImFwb1wiLCBwYXJhbXMpO1xuXG4gICAgcmV0dXJuIGRhdGEgPT5cbiAgICAgIGV4ZWN1dGUoe1xuICAgICAgICBpbmRpY2F0b3I6IHR1bGluZC5pbmRpY2F0b3JzLmFwbyxcbiAgICAgICAgaW5wdXRzOiBbZGF0YS5jbG9zZV0sXG4gICAgICAgIG9wdGlvbnM6IFtwYXJhbXMub3B0SW5GYXN0UGVyaW9kLCBwYXJhbXMub3B0SW5TbG93UGVyaW9kXSxcbiAgICAgICAgcmVzdWx0czogW1wicmVzdWx0XCJdXG4gICAgICB9KTtcbiAgfVxufTtcblxubWV0aG9kcy5hcm9vbiA9IHtcbiAgcmVxdWlyZXM6IFtcIm9wdEluVGltZVBlcmlvZFwiXSxcbiAgY3JlYXRlOiBwYXJhbXMgPT4ge1xuICAgIHZlcmlmeVBhcmFtcyhcImFyb29uXCIsIHBhcmFtcyk7XG5cbiAgICByZXR1cm4gZGF0YSA9PlxuICAgICAgZXhlY3V0ZSh7XG4gICAgICAgIGluZGljYXRvcjogdHVsaW5kLmluZGljYXRvcnMuYXJvb24sXG4gICAgICAgIGlucHV0czogW2RhdGEuaGlnaCwgZGF0YS5sb3ddLFxuICAgICAgICBvcHRpb25zOiBbcGFyYW1zLm9wdEluVGltZVBlcmlvZF0sXG4gICAgICAgIHJlc3VsdHM6IFtcImFyb29uRG93blwiLCBcImFyb29uVXBcIl1cbiAgICAgIH0pO1xuICB9XG59O1xuXG5tZXRob2RzLmFyb29ub3NjID0ge1xuICByZXF1aXJlczogW1wib3B0SW5UaW1lUGVyaW9kXCJdLFxuICBjcmVhdGU6IHBhcmFtcyA9PiB7XG4gICAgdmVyaWZ5UGFyYW1zKFwiYXJvb25vc2NcIiwgcGFyYW1zKTtcblxuICAgIHJldHVybiBkYXRhID0+XG4gICAgICBleGVjdXRlKHtcbiAgICAgICAgaW5kaWNhdG9yOiB0dWxpbmQuaW5kaWNhdG9ycy5hcm9vbm9zYyxcbiAgICAgICAgaW5wdXRzOiBbZGF0YS5oaWdoLCBkYXRhLmxvd10sXG4gICAgICAgIG9wdGlvbnM6IFtwYXJhbXMub3B0SW5UaW1lUGVyaW9kXSxcbiAgICAgICAgcmVzdWx0czogW1wicmVzdWx0XCJdXG4gICAgICB9KTtcbiAgfVxufTtcblxubWV0aG9kcy5hdHIgPSB7XG4gIHJlcXVpcmVzOiBbXCJvcHRJblRpbWVQZXJpb2RcIl0sXG4gIGNyZWF0ZTogcGFyYW1zID0+IHtcbiAgICB2ZXJpZnlQYXJhbXMoXCJhdHJcIiwgcGFyYW1zKTtcblxuICAgIHJldHVybiBkYXRhID0+XG4gICAgICBleGVjdXRlKHtcbiAgICAgICAgaW5kaWNhdG9yOiB0dWxpbmQuaW5kaWNhdG9ycy5hdHIsXG4gICAgICAgIGlucHV0czogW2RhdGEuaGlnaCwgZGF0YS5sb3csIGRhdGEuY2xvc2VdLFxuICAgICAgICBvcHRpb25zOiBbcGFyYW1zLm9wdEluVGltZVBlcmlvZF0sXG4gICAgICAgIHJlc3VsdHM6IFtcInJlc3VsdFwiXVxuICAgICAgfSk7XG4gIH1cbn07XG5cbm1ldGhvZHMuYXZncHJpY2UgPSB7XG4gIHJlcXVpcmVzOiBbXSxcbiAgY3JlYXRlOiBwYXJhbXMgPT4ge1xuICAgIHZlcmlmeVBhcmFtcyhcImF2Z3ByaWNlXCIsIHBhcmFtcyk7XG5cbiAgICByZXR1cm4gZGF0YSA9PlxuICAgICAgZXhlY3V0ZSh7XG4gICAgICAgIGluZGljYXRvcjogdHVsaW5kLmluZGljYXRvcnMuYXZncHJpY2UsXG4gICAgICAgIGlucHV0czogW2RhdGEub3BlbiwgZGF0YS5oaWdoLCBkYXRhLmxvdywgZGF0YS5jbG9zZV0sXG4gICAgICAgIG9wdGlvbnM6IFtdLFxuICAgICAgICByZXN1bHRzOiBbXCJyZXN1bHRcIl1cbiAgICAgIH0pO1xuICB9XG59O1xuXG5tZXRob2RzLmJiYW5kcyA9IHtcbiAgcmVxdWlyZXM6IFtcIm9wdEluVGltZVBlcmlvZFwiLCBcIm9wdEluTmJTdGREZXZzXCJdLFxuICBjcmVhdGU6IHBhcmFtcyA9PiB7XG4gICAgdmVyaWZ5UGFyYW1zKFwiYmJhbmRzXCIsIHBhcmFtcyk7XG5cbiAgICByZXR1cm4gZGF0YSA9PlxuICAgICAgZXhlY3V0ZSh7XG4gICAgICAgIGluZGljYXRvcjogdHVsaW5kLmluZGljYXRvcnMuYmJhbmRzLFxuICAgICAgICBpbnB1dHM6IFtkYXRhLmNsb3NlXSxcbiAgICAgICAgb3B0aW9uczogW3BhcmFtcy5vcHRJblRpbWVQZXJpb2QsIHBhcmFtcy5vcHRJbk5iU3RkRGV2c10sXG4gICAgICAgIHJlc3VsdHM6IFtcImJiYW5kc0xvd2VyXCIsIFwiYmJhbmRzTWlkZGxlXCIsIFwiYmJhbmRzVXBwZXJcIl1cbiAgICAgIH0pO1xuICB9XG59O1xuXG5tZXRob2RzLmJvcCA9IHtcbiAgcmVxdWlyZXM6IFtdLFxuICBjcmVhdGU6IHBhcmFtcyA9PiB7XG4gICAgdmVyaWZ5UGFyYW1zKFwiYm9wXCIsIHBhcmFtcyk7XG5cbiAgICByZXR1cm4gZGF0YSA9PlxuICAgICAgZXhlY3V0ZSh7XG4gICAgICAgIGluZGljYXRvcjogdHVsaW5kLmluZGljYXRvcnMuYm9wLFxuICAgICAgICBpbnB1dHM6IFtkYXRhLm9wZW4sIGRhdGEuaGlnaCwgZGF0YS5sb3csIGRhdGEuY2xvc2VdLFxuICAgICAgICBvcHRpb25zOiBbXSxcbiAgICAgICAgcmVzdWx0czogW1wicmVzdWx0XCJdXG4gICAgICB9KTtcbiAgfVxufTtcblxubWV0aG9kcy5jY2kgPSB7XG4gIHJlcXVpcmVzOiBbXCJvcHRJblRpbWVQZXJpb2RcIl0sXG4gIGNyZWF0ZTogcGFyYW1zID0+IHtcbiAgICB2ZXJpZnlQYXJhbXMoXCJjY2lcIiwgcGFyYW1zKTtcblxuICAgIHJldHVybiBkYXRhID0+XG4gICAgICBleGVjdXRlKHtcbiAgICAgICAgaW5kaWNhdG9yOiB0dWxpbmQuaW5kaWNhdG9ycy5jY2ksXG4gICAgICAgIGlucHV0czogW2RhdGEuaGlnaCwgZGF0YS5sb3csIGRhdGEuY2xvc2VdLFxuICAgICAgICBvcHRpb25zOiBbcGFyYW1zLm9wdEluVGltZVBlcmlvZF0sXG4gICAgICAgIHJlc3VsdHM6IFtcInJlc3VsdFwiXVxuICAgICAgfSk7XG4gIH1cbn07XG5cbm1ldGhvZHMuY21vID0ge1xuICByZXF1aXJlczogW1wib3B0SW5UaW1lUGVyaW9kXCJdLFxuICBjcmVhdGU6IHBhcmFtcyA9PiB7XG4gICAgdmVyaWZ5UGFyYW1zKFwiY21vXCIsIHBhcmFtcyk7XG5cbiAgICByZXR1cm4gZGF0YSA9PlxuICAgICAgZXhlY3V0ZSh7XG4gICAgICAgIGluZGljYXRvcjogdHVsaW5kLmluZGljYXRvcnMuY21vLFxuICAgICAgICBpbnB1dHM6IFtkYXRhLmNsb3NlXSxcbiAgICAgICAgb3B0aW9uczogW3BhcmFtcy5vcHRJblRpbWVQZXJpb2RdLFxuICAgICAgICByZXN1bHRzOiBbXCJyZXN1bHRcIl1cbiAgICAgIH0pO1xuICB9XG59O1xuXG5tZXRob2RzLmN2aSA9IHtcbiAgcmVxdWlyZXM6IFtcIm9wdEluVGltZVBlcmlvZFwiXSxcbiAgY3JlYXRlOiBwYXJhbXMgPT4ge1xuICAgIHZlcmlmeVBhcmFtcyhcImN2aVwiLCBwYXJhbXMpO1xuXG4gICAgcmV0dXJuIGRhdGEgPT5cbiAgICAgIGV4ZWN1dGUoe1xuICAgICAgICBpbmRpY2F0b3I6IHR1bGluZC5pbmRpY2F0b3JzLmN2aSxcbiAgICAgICAgaW5wdXRzOiBbZGF0YS5oaWdoLCBkYXRhLmxvd10sXG4gICAgICAgIG9wdGlvbnM6IFtwYXJhbXMub3B0SW5UaW1lUGVyaW9kXSxcbiAgICAgICAgcmVzdWx0czogW1wicmVzdWx0XCJdXG4gICAgICB9KTtcbiAgfVxufTtcblxubWV0aG9kcy5kZW1hID0ge1xuICByZXF1aXJlczogW1wib3B0SW5UaW1lUGVyaW9kXCJdLFxuICBjcmVhdGU6IHBhcmFtcyA9PiB7XG4gICAgdmVyaWZ5UGFyYW1zKFwiZGVtYVwiLCBwYXJhbXMpO1xuXG4gICAgcmV0dXJuIGRhdGEgPT5cbiAgICAgIGV4ZWN1dGUoe1xuICAgICAgICBpbmRpY2F0b3I6IHR1bGluZC5pbmRpY2F0b3JzLmRlbWEsXG4gICAgICAgIGlucHV0czogW2RhdGEuY2xvc2VdLFxuICAgICAgICBvcHRpb25zOiBbcGFyYW1zLm9wdEluVGltZVBlcmlvZF0sXG4gICAgICAgIHJlc3VsdHM6IFtcInJlc3VsdFwiXVxuICAgICAgfSk7XG4gIH1cbn07XG5cbm1ldGhvZHMuZGkgPSB7XG4gIHJlcXVpcmVzOiBbXCJvcHRJblRpbWVQZXJpb2RcIl0sXG4gIGNyZWF0ZTogcGFyYW1zID0+IHtcbiAgICB2ZXJpZnlQYXJhbXMoXCJkaVwiLCBwYXJhbXMpO1xuXG4gICAgcmV0dXJuIGRhdGEgPT5cbiAgICAgIGV4ZWN1dGUoe1xuICAgICAgICBpbmRpY2F0b3I6IHR1bGluZC5pbmRpY2F0b3JzLmRpLFxuICAgICAgICBpbnB1dHM6IFtkYXRhLmhpZ2gsIGRhdGEubG93LCBkYXRhLmNsb3NlXSxcbiAgICAgICAgb3B0aW9uczogW3BhcmFtcy5vcHRJblRpbWVQZXJpb2RdLFxuICAgICAgICByZXN1bHRzOiBbXCJkaVBsdXNcIiwgXCJkaU1pbnVzXCJdXG4gICAgICB9KTtcbiAgfVxufTtcblxubWV0aG9kcy5kbSA9IHtcbiAgcmVxdWlyZXM6IFtcIm9wdEluVGltZVBlcmlvZFwiXSxcbiAgY3JlYXRlOiBwYXJhbXMgPT4ge1xuICAgIHZlcmlmeVBhcmFtcyhcImRtXCIsIHBhcmFtcyk7XG5cbiAgICByZXR1cm4gZGF0YSA9PlxuICAgICAgZXhlY3V0ZSh7XG4gICAgICAgIGluZGljYXRvcjogdHVsaW5kLmluZGljYXRvcnMuZG0sXG4gICAgICAgIGlucHV0czogW2RhdGEuaGlnaCwgZGF0YS5sb3ddLFxuICAgICAgICBvcHRpb25zOiBbcGFyYW1zLm9wdEluVGltZVBlcmlvZF0sXG4gICAgICAgIHJlc3VsdHM6IFtcImRtUGx1c1wiLCBcImRtTG93XCJdXG4gICAgICB9KTtcbiAgfVxufTtcblxubWV0aG9kcy5kcG8gPSB7XG4gIHJlcXVpcmVzOiBbXCJvcHRJblRpbWVQZXJpb2RcIl0sXG4gIGNyZWF0ZTogcGFyYW1zID0+IHtcbiAgICB2ZXJpZnlQYXJhbXMoXCJkcG9cIiwgcGFyYW1zKTtcblxuICAgIHJldHVybiBkYXRhID0+XG4gICAgICBleGVjdXRlKHtcbiAgICAgICAgaW5kaWNhdG9yOiB0dWxpbmQuaW5kaWNhdG9ycy5kcG8sXG4gICAgICAgIGlucHV0czogW2RhdGEuY2xvc2VdLFxuICAgICAgICBvcHRpb25zOiBbcGFyYW1zLm9wdEluVGltZVBlcmlvZF0sXG4gICAgICAgIHJlc3VsdHM6IFtcInJlc3VsdFwiXVxuICAgICAgfSk7XG4gIH1cbn07XG5cbm1ldGhvZHMuZHggPSB7XG4gIHJlcXVpcmVzOiBbXCJvcHRJblRpbWVQZXJpb2RcIl0sXG4gIGNyZWF0ZTogcGFyYW1zID0+IHtcbiAgICB2ZXJpZnlQYXJhbXMoXCJkeFwiLCBwYXJhbXMpO1xuXG4gICAgcmV0dXJuIGRhdGEgPT5cbiAgICAgIGV4ZWN1dGUoe1xuICAgICAgICBpbmRpY2F0b3I6IHR1bGluZC5pbmRpY2F0b3JzLmR4LFxuICAgICAgICBpbnB1dHM6IFtkYXRhLmhpZ2gsIGRhdGEubG93LCBkYXRhLmNsb3NlXSxcbiAgICAgICAgb3B0aW9uczogW3BhcmFtcy5vcHRJblRpbWVQZXJpb2RdLFxuICAgICAgICByZXN1bHRzOiBbXCJyZXN1bHRcIl1cbiAgICAgIH0pO1xuICB9XG59O1xuXG5tZXRob2RzLmVtYSA9IHtcbiAgcmVxdWlyZXM6IFtcIm9wdEluVGltZVBlcmlvZFwiXSxcbiAgY3JlYXRlOiBwYXJhbXMgPT4ge1xuICAgIHZlcmlmeVBhcmFtcyhcImVtYVwiLCBwYXJhbXMpO1xuXG4gICAgcmV0dXJuIGRhdGEgPT5cbiAgICAgIGV4ZWN1dGUoe1xuICAgICAgICBpbmRpY2F0b3I6IHR1bGluZC5pbmRpY2F0b3JzLmVtYSxcbiAgICAgICAgaW5wdXRzOiBbZGF0YS5jbG9zZV0sXG4gICAgICAgIG9wdGlvbnM6IFtwYXJhbXMub3B0SW5UaW1lUGVyaW9kXSxcbiAgICAgICAgcmVzdWx0czogW1wicmVzdWx0XCJdXG4gICAgICB9KTtcbiAgfVxufTtcblxubWV0aG9kcy5lbXYgPSB7XG4gIHJlcXVpcmVzOiBbXSxcbiAgY3JlYXRlOiBwYXJhbXMgPT4ge1xuICAgIHZlcmlmeVBhcmFtcyhcImVtdlwiLCBwYXJhbXMpO1xuXG4gICAgcmV0dXJuIGRhdGEgPT5cbiAgICAgIGV4ZWN1dGUoe1xuICAgICAgICBpbmRpY2F0b3I6IHR1bGluZC5pbmRpY2F0b3JzLmVtdixcbiAgICAgICAgaW5wdXRzOiBbZGF0YS5oaWdoLCBkYXRhLmxvdywgZGF0YS52b2x1bWVdLFxuICAgICAgICBvcHRpb25zOiBbcGFyYW1zLm9wdEluVGltZVBlcmlvZF0sXG4gICAgICAgIHJlc3VsdHM6IFtdXG4gICAgICB9KTtcbiAgfVxufTtcblxubWV0aG9kcy5maXNoZXIgPSB7XG4gIHJlcXVpcmVzOiBbXCJvcHRJblRpbWVQZXJpb2RcIl0sXG4gIGNyZWF0ZTogcGFyYW1zID0+IHtcbiAgICB2ZXJpZnlQYXJhbXMoXCJmaXNoZXJcIiwgcGFyYW1zKTtcblxuICAgIHJldHVybiBkYXRhID0+XG4gICAgICBleGVjdXRlKHtcbiAgICAgICAgaW5kaWNhdG9yOiB0dWxpbmQuaW5kaWNhdG9ycy5maXNoZXIsXG4gICAgICAgIGlucHV0czogW2RhdGEuaGlnaCwgZGF0YS5sb3ddLFxuICAgICAgICBvcHRpb25zOiBbcGFyYW1zLm9wdEluVGltZVBlcmlvZF0sXG4gICAgICAgIHJlc3VsdHM6IFtcImZpc2hlclwiLCBcImZpc2hlclBlcmlvZFwiXVxuICAgICAgfSk7XG4gIH1cbn07XG5cbm1ldGhvZHMuZm9zYyA9IHtcbiAgcmVxdWlyZXM6IFtcIm9wdEluVGltZVBlcmlvZFwiXSxcbiAgY3JlYXRlOiBwYXJhbXMgPT4ge1xuICAgIHZlcmlmeVBhcmFtcyhcImZvc2NcIiwgcGFyYW1zKTtcblxuICAgIHJldHVybiBkYXRhID0+XG4gICAgICBleGVjdXRlKHtcbiAgICAgICAgaW5kaWNhdG9yOiB0dWxpbmQuaW5kaWNhdG9ycy5mb3NjLFxuICAgICAgICBpbnB1dHM6IFtkYXRhLmNsb3NlXSxcbiAgICAgICAgb3B0aW9uczogW3BhcmFtcy5vcHRJblRpbWVQZXJpb2RdLFxuICAgICAgICByZXN1bHRzOiBbXCJyZXN1bHRcIl1cbiAgICAgIH0pO1xuICB9XG59O1xuXG5tZXRob2RzLmhtYSA9IHtcbiAgcmVxdWlyZXM6IFtcIm9wdEluVGltZVBlcmlvZFwiXSxcbiAgY3JlYXRlOiBwYXJhbXMgPT4ge1xuICAgIHZlcmlmeVBhcmFtcyhcImhtYVwiLCBwYXJhbXMpO1xuXG4gICAgcmV0dXJuIGRhdGEgPT5cbiAgICAgIGV4ZWN1dGUoe1xuICAgICAgICBpbmRpY2F0b3I6IHR1bGluZC5pbmRpY2F0b3JzLmhtYSxcbiAgICAgICAgaW5wdXRzOiBbZGF0YS5jbG9zZV0sXG4gICAgICAgIG9wdGlvbnM6IFtwYXJhbXMub3B0SW5UaW1lUGVyaW9kXSxcbiAgICAgICAgcmVzdWx0czogW1wicmVzdWx0XCJdXG4gICAgICB9KTtcbiAgfVxufTtcblxubWV0aG9kcy5rYW1hID0ge1xuICByZXF1aXJlczogW1wib3B0SW5UaW1lUGVyaW9kXCJdLFxuICBjcmVhdGU6IHBhcmFtcyA9PiB7XG4gICAgdmVyaWZ5UGFyYW1zKFwia2FtYVwiLCBwYXJhbXMpO1xuXG4gICAgcmV0dXJuIGRhdGEgPT5cbiAgICAgIGV4ZWN1dGUoe1xuICAgICAgICBpbmRpY2F0b3I6IHR1bGluZC5pbmRpY2F0b3JzLmthbWEsXG4gICAgICAgIGlucHV0czogW2RhdGEuY2xvc2VdLFxuICAgICAgICBvcHRpb25zOiBbcGFyYW1zLm9wdEluVGltZVBlcmlvZF0sXG4gICAgICAgIHJlc3VsdHM6IFtcInJlc3VsdFwiXVxuICAgICAgfSk7XG4gIH1cbn07XG5cbm1ldGhvZHMua3ZvID0ge1xuICByZXF1aXJlczogW1wib3B0SW5GYXN0UGVyaW9kXCIsIFwib3B0SW5TbG93UGVyaW9kXCJdLFxuICBjcmVhdGU6IHBhcmFtcyA9PiB7XG4gICAgdmVyaWZ5UGFyYW1zKFwia3ZvXCIsIHBhcmFtcyk7XG5cbiAgICByZXR1cm4gZGF0YSA9PlxuICAgICAgZXhlY3V0ZSh7XG4gICAgICAgIGluZGljYXRvcjogdHVsaW5kLmluZGljYXRvcnMua3ZvLFxuICAgICAgICBpbnB1dHM6IFtkYXRhLmhpZ2gsIGRhdGEubG93LCBkYXRhLmNsb3NlLCBkYXRhLnZvbHVtZV0sXG4gICAgICAgIG9wdGlvbnM6IFtwYXJhbXMub3B0SW5GYXN0UGVyaW9kLCBwYXJhbXMub3B0SW5TbG93UGVyaW9kXSxcbiAgICAgICAgcmVzdWx0czogW1wicmVzdWx0XCJdXG4gICAgICB9KTtcbiAgfVxufTtcblxubWV0aG9kcy5saW5yZWcgPSB7XG4gIHJlcXVpcmVzOiBbXCJvcHRJblRpbWVQZXJpb2RcIl0sXG4gIGNyZWF0ZTogcGFyYW1zID0+IHtcbiAgICB2ZXJpZnlQYXJhbXMoXCJsaW5yZWdcIiwgcGFyYW1zKTtcblxuICAgIHJldHVybiBkYXRhID0+XG4gICAgICBleGVjdXRlKHtcbiAgICAgICAgaW5kaWNhdG9yOiB0dWxpbmQuaW5kaWNhdG9ycy5saW5yZWcsXG4gICAgICAgIGlucHV0czogW2RhdGEuY2xvc2VdLFxuICAgICAgICBvcHRpb25zOiBbcGFyYW1zLm9wdEluVGltZVBlcmlvZF0sXG4gICAgICAgIHJlc3VsdHM6IFtcInJlc3VsdFwiXVxuICAgICAgfSk7XG4gIH1cbn07XG5cbm1ldGhvZHMubGlucmVnaW50ZXJjZXB0ID0ge1xuICByZXF1aXJlczogW1wib3B0SW5UaW1lUGVyaW9kXCJdLFxuICBjcmVhdGU6IHBhcmFtcyA9PiB7XG4gICAgdmVyaWZ5UGFyYW1zKFwibGlucmVnaW50ZXJjZXB0XCIsIHBhcmFtcyk7XG5cbiAgICByZXR1cm4gZGF0YSA9PlxuICAgICAgZXhlY3V0ZSh7XG4gICAgICAgIGluZGljYXRvcjogdHVsaW5kLmluZGljYXRvcnMubGlucmVnaW50ZXJjZXB0LFxuICAgICAgICBpbnB1dHM6IFtkYXRhLmNsb3NlXSxcbiAgICAgICAgb3B0aW9uczogW3BhcmFtcy5vcHRJblRpbWVQZXJpb2RdLFxuICAgICAgICByZXN1bHRzOiBbXCJyZXN1bHRcIl1cbiAgICAgIH0pO1xuICB9XG59O1xuXG5tZXRob2RzLmxpbnJlZ3Nsb3BlID0ge1xuICByZXF1aXJlczogW1wib3B0SW5UaW1lUGVyaW9kXCJdLFxuICBjcmVhdGU6IHBhcmFtcyA9PiB7XG4gICAgdmVyaWZ5UGFyYW1zKFwibGlucmVnc2xvcGVcIiwgcGFyYW1zKTtcblxuICAgIHJldHVybiBkYXRhID0+XG4gICAgICBleGVjdXRlKHtcbiAgICAgICAgaW5kaWNhdG9yOiB0dWxpbmQuaW5kaWNhdG9ycy5saW5yZWdzbG9wZSxcbiAgICAgICAgaW5wdXRzOiBbZGF0YS5jbG9zZV0sXG4gICAgICAgIG9wdGlvbnM6IFtwYXJhbXMub3B0SW5UaW1lUGVyaW9kXSxcbiAgICAgICAgcmVzdWx0czogW1wicmVzdWx0XCJdXG4gICAgICB9KTtcbiAgfVxufTtcblxubWV0aG9kcy5tYWNkID0ge1xuICByZXF1aXJlczogW1wib3B0SW5GYXN0UGVyaW9kXCIsIFwib3B0SW5TbG93UGVyaW9kXCIsIFwib3B0SW5TaWduYWxQZXJpb2RcIl0sXG4gIGNyZWF0ZTogcGFyYW1zID0+IHtcbiAgICB2ZXJpZnlQYXJhbXMoXCJtYWNkXCIsIHBhcmFtcyk7XG5cbiAgICByZXR1cm4gZGF0YSA9PlxuICAgICAgZXhlY3V0ZSh7XG4gICAgICAgIGluZGljYXRvcjogdHVsaW5kLmluZGljYXRvcnMubWFjZCxcbiAgICAgICAgaW5wdXRzOiBbZGF0YS5jbG9zZV0sXG4gICAgICAgIG9wdGlvbnM6IFtcbiAgICAgICAgICBwYXJhbXMub3B0SW5GYXN0UGVyaW9kLFxuICAgICAgICAgIHBhcmFtcy5vcHRJblNsb3dQZXJpb2QsXG4gICAgICAgICAgcGFyYW1zLm9wdEluU2lnbmFsUGVyaW9kXG4gICAgICAgIF0sXG4gICAgICAgIHJlc3VsdHM6IFtcIm1hY2RcIiwgXCJtYWNkU2lnbmFsXCIsIFwibWFjZEhpc3RvZ3JhbVwiXVxuICAgICAgfSk7XG4gIH1cbn07XG5cbm1ldGhvZHMubWFya2V0ZmkgPSB7XG4gIHJlcXVpcmVzOiBbXSxcbiAgY3JlYXRlOiBwYXJhbXMgPT4ge1xuICAgIHZlcmlmeVBhcmFtcyhcIm1hcmtldGZpXCIsIHBhcmFtcyk7XG5cbiAgICByZXR1cm4gZGF0YSA9PlxuICAgICAgZXhlY3V0ZSh7XG4gICAgICAgIGluZGljYXRvcjogdHVsaW5kLmluZGljYXRvcnMubWFya2V0ZmksXG4gICAgICAgIGlucHV0czogW2RhdGEuaGlnaCwgZGF0YS5sb3csIGRhdGEudm9sdW1lXSxcbiAgICAgICAgb3B0aW9uczogW10sXG4gICAgICAgIHJlc3VsdHM6IFtcInJlc3VsdFwiXVxuICAgICAgfSk7XG4gIH1cbn07XG5cbm1ldGhvZHMubWFzcyA9IHtcbiAgcmVxdWlyZXM6IFtcIm9wdEluVGltZVBlcmlvZFwiXSxcbiAgY3JlYXRlOiBwYXJhbXMgPT4ge1xuICAgIHZlcmlmeVBhcmFtcyhcIm1hc3NcIiwgcGFyYW1zKTtcblxuICAgIHJldHVybiBkYXRhID0+XG4gICAgICBleGVjdXRlKHtcbiAgICAgICAgaW5kaWNhdG9yOiB0dWxpbmQuaW5kaWNhdG9ycy5tYXNzLFxuICAgICAgICBpbnB1dHM6IFtkYXRhLmhpZ2gsIGRhdGEubG93XSxcbiAgICAgICAgb3B0aW9uczogW3BhcmFtcy5vcHRJblRpbWVQZXJpb2RdLFxuICAgICAgICByZXN1bHRzOiBbXCJyZXN1bHRcIl1cbiAgICAgIH0pO1xuICB9XG59O1xuXG5tZXRob2RzLm1lZHByaWNlID0ge1xuICByZXF1aXJlczogW10sXG4gIGNyZWF0ZTogcGFyYW1zID0+IHtcbiAgICB2ZXJpZnlQYXJhbXMoXCJtZWRwcmljZVwiLCBwYXJhbXMpO1xuXG4gICAgcmV0dXJuIGRhdGEgPT5cbiAgICAgIGV4ZWN1dGUoe1xuICAgICAgICBpbmRpY2F0b3I6IHR1bGluZC5pbmRpY2F0b3JzLm1lZHByaWNlLFxuICAgICAgICBpbnB1dHM6IFtkYXRhLmhpZ2gsIGRhdGEubG93XSxcbiAgICAgICAgb3B0aW9uczogW10sXG4gICAgICAgIHJlc3VsdHM6IFtcInJlc3VsdFwiXVxuICAgICAgfSk7XG4gIH1cbn07XG5cbm1ldGhvZHMubWZpID0ge1xuICByZXF1aXJlczogW1wib3B0SW5UaW1lUGVyaW9kXCJdLFxuICBjcmVhdGU6IHBhcmFtcyA9PiB7XG4gICAgdmVyaWZ5UGFyYW1zKFwibWZpXCIsIHBhcmFtcyk7XG5cbiAgICByZXR1cm4gZGF0YSA9PlxuICAgICAgZXhlY3V0ZSh7XG4gICAgICAgIGluZGljYXRvcjogdHVsaW5kLmluZGljYXRvcnMubWZpLFxuICAgICAgICBpbnB1dHM6IFtkYXRhLmhpZ2gsIGRhdGEubG93LCBkYXRhLmNsb3NlLCBkYXRhLnZvbHVtZV0sXG4gICAgICAgIG9wdGlvbnM6IFtwYXJhbXMub3B0SW5UaW1lUGVyaW9kXSxcbiAgICAgICAgcmVzdWx0czogW1wicmVzdWx0XCJdXG4gICAgICB9KTtcbiAgfVxufTtcblxubWV0aG9kcy5tc3cgPSB7XG4gIHJlcXVpcmVzOiBbXCJvcHRJblRpbWVQZXJpb2RcIl0sXG4gIGNyZWF0ZTogcGFyYW1zID0+IHtcbiAgICB2ZXJpZnlQYXJhbXMoXCJtc3dcIiwgcGFyYW1zKTtcblxuICAgIHJldHVybiBkYXRhID0+XG4gICAgICBleGVjdXRlKHtcbiAgICAgICAgaW5kaWNhdG9yOiB0dWxpbmQuaW5kaWNhdG9ycy5tc3csXG4gICAgICAgIGlucHV0czogW2RhdGEuY2xvc2VdLFxuICAgICAgICBvcHRpb25zOiBbcGFyYW1zLm9wdEluVGltZVBlcmlvZF0sXG4gICAgICAgIHJlc3VsdHM6IFtcIm1zd1NpbmVcIiwgXCJtc3dMZWFkXCJdXG4gICAgICB9KTtcbiAgfVxufTtcblxubWV0aG9kcy5uYXRyID0ge1xuICByZXF1aXJlczogW1wib3B0SW5UaW1lUGVyaW9kXCJdLFxuICBjcmVhdGU6IHBhcmFtcyA9PiB7XG4gICAgdmVyaWZ5UGFyYW1zKFwibmF0clwiLCBwYXJhbXMpO1xuXG4gICAgcmV0dXJuIGRhdGEgPT5cbiAgICAgIGV4ZWN1dGUoe1xuICAgICAgICBpbmRpY2F0b3I6IHR1bGluZC5pbmRpY2F0b3JzLm5hdHIsXG4gICAgICAgIGlucHV0czogW2RhdGEuaGlnaCwgZGF0YS5sb3csIGRhdGEuY2xvc2VdLFxuICAgICAgICBvcHRpb25zOiBbcGFyYW1zLm9wdEluVGltZVBlcmlvZF0sXG4gICAgICAgIHJlc3VsdHM6IFtcInJlc3VsdFwiXVxuICAgICAgfSk7XG4gIH1cbn07XG5cbm1ldGhvZHMubnZpID0ge1xuICByZXF1aXJlczogW10sXG4gIGNyZWF0ZTogcGFyYW1zID0+IHtcbiAgICB2ZXJpZnlQYXJhbXMoXCJudmlcIiwgcGFyYW1zKTtcblxuICAgIHJldHVybiBkYXRhID0+XG4gICAgICBleGVjdXRlKHtcbiAgICAgICAgaW5kaWNhdG9yOiB0dWxpbmQuaW5kaWNhdG9ycy5udmksXG4gICAgICAgIGlucHV0czogW2RhdGEuY2xvc2UsIGRhdGEudm9sdW1lXSxcbiAgICAgICAgb3B0aW9uczogW10sXG4gICAgICAgIHJlc3VsdHM6IFtcInJlc3VsdFwiXVxuICAgICAgfSk7XG4gIH1cbn07XG5cbm1ldGhvZHMub2J2ID0ge1xuICByZXF1aXJlczogW10sXG4gIGNyZWF0ZTogcGFyYW1zID0+IHtcbiAgICB2ZXJpZnlQYXJhbXMoXCJvYnZcIiwgcGFyYW1zKTtcblxuICAgIHJldHVybiBkYXRhID0+XG4gICAgICBleGVjdXRlKHtcbiAgICAgICAgaW5kaWNhdG9yOiB0dWxpbmQuaW5kaWNhdG9ycy5vYnYsXG4gICAgICAgIGlucHV0czogW2RhdGEuY2xvc2UsIGRhdGEudm9sdW1lXSxcbiAgICAgICAgb3B0aW9uczogW10sXG4gICAgICAgIHJlc3VsdHM6IFtcInJlc3VsdFwiXVxuICAgICAgfSk7XG4gIH1cbn07XG5cbm1ldGhvZHMucHBvID0ge1xuICByZXF1aXJlczogW1wib3B0SW5GYXN0UGVyaW9kXCIsIFwib3B0SW5TbG93UGVyaW9kXCJdLFxuICBjcmVhdGU6IHBhcmFtcyA9PiB7XG4gICAgdmVyaWZ5UGFyYW1zKFwicHBvXCIsIHBhcmFtcyk7XG5cbiAgICByZXR1cm4gZGF0YSA9PlxuICAgICAgZXhlY3V0ZSh7XG4gICAgICAgIGluZGljYXRvcjogdHVsaW5kLmluZGljYXRvcnMucHBvLFxuICAgICAgICBpbnB1dHM6IFtkYXRhLmNsb3NlXSxcbiAgICAgICAgb3B0aW9uczogW3BhcmFtcy5vcHRJbkZhc3RQZXJpb2QsIHBhcmFtcy5vcHRJblNsb3dQZXJpb2RdLFxuICAgICAgICByZXN1bHRzOiBbXCJyZXN1bHRcIl1cbiAgICAgIH0pO1xuICB9XG59O1xuXG5tZXRob2RzLnBzYXIgPSB7XG4gIHJlcXVpcmVzOiBbXCJvcHRJbkFjY2VsZXJhdGlvblwiLCBcIm9wdEluTWF4aW11bVwiXSxcbiAgY3JlYXRlOiBwYXJhbXMgPT4ge1xuICAgIHZlcmlmeVBhcmFtcyhcInBzYXJcIiwgcGFyYW1zKTtcblxuICAgIHJldHVybiBkYXRhID0+XG4gICAgICBleGVjdXRlKHtcbiAgICAgICAgaW5kaWNhdG9yOiB0dWxpbmQuaW5kaWNhdG9ycy5wc2FyLFxuICAgICAgICBpbnB1dHM6IFtkYXRhLmhpZ2gsIGRhdGEubG93XSxcbiAgICAgICAgb3B0aW9uczogW3BhcmFtcy5vcHRJbkFjY2VsZXJhdGlvbiwgcGFyYW1zLm9wdEluTWF4aW11bV0sXG4gICAgICAgIHJlc3VsdHM6IFtcInJlc3VsdFwiXVxuICAgICAgfSk7XG4gIH1cbn07XG5cbm1ldGhvZHMucHZpID0ge1xuICByZXF1aXJlczogW10sXG4gIGNyZWF0ZTogcGFyYW1zID0+IHtcbiAgICB2ZXJpZnlQYXJhbXMoXCJwdmlcIiwgcGFyYW1zKTtcblxuICAgIHJldHVybiBkYXRhID0+XG4gICAgICBleGVjdXRlKHtcbiAgICAgICAgaW5kaWNhdG9yOiB0dWxpbmQuaW5kaWNhdG9ycy5wdmksXG4gICAgICAgIGlucHV0czogW2RhdGEuY2xvc2UsIGRhdGEudm9sdW1lXSxcbiAgICAgICAgb3B0aW9uczogW10sXG4gICAgICAgIHJlc3VsdHM6IFtcInJlc3VsdFwiXVxuICAgICAgfSk7XG4gIH1cbn07XG5cbm1ldGhvZHMucXN0aWNrID0ge1xuICByZXF1aXJlczogW1wib3B0SW5UaW1lUGVyaW9kXCJdLFxuICBjcmVhdGU6IHBhcmFtcyA9PiB7XG4gICAgdmVyaWZ5UGFyYW1zKFwicXN0aWNrXCIsIHBhcmFtcyk7XG5cbiAgICByZXR1cm4gZGF0YSA9PlxuICAgICAgZXhlY3V0ZSh7XG4gICAgICAgIGluZGljYXRvcjogdHVsaW5kLmluZGljYXRvcnMucXN0aWNrLFxuICAgICAgICBpbnB1dHM6IFtkYXRhLm9wZW4sIGRhdGEuY2xvc2VdLFxuICAgICAgICBvcHRpb25zOiBbcGFyYW1zLm9wdEluVGltZVBlcmlvZF0sXG4gICAgICAgIHJlc3VsdHM6IFtcInJlc3VsdFwiXVxuICAgICAgfSk7XG4gIH1cbn07XG5cbm1ldGhvZHMucm9jID0ge1xuICByZXF1aXJlczogW1wib3B0SW5UaW1lUGVyaW9kXCJdLFxuICBjcmVhdGU6IHBhcmFtcyA9PiB7XG4gICAgdmVyaWZ5UGFyYW1zKFwicm9jXCIsIHBhcmFtcyk7XG5cbiAgICByZXR1cm4gZGF0YSA9PlxuICAgICAgZXhlY3V0ZSh7XG4gICAgICAgIGluZGljYXRvcjogdHVsaW5kLmluZGljYXRvcnMucm9jLFxuICAgICAgICBpbnB1dHM6IFtkYXRhLmNsb3NlXSxcbiAgICAgICAgb3B0aW9uczogW3BhcmFtcy5vcHRJblRpbWVQZXJpb2RdLFxuICAgICAgICByZXN1bHRzOiBbXCJyZXN1bHRcIl1cbiAgICAgIH0pO1xuICB9XG59O1xuXG5tZXRob2RzLnJvY3IgPSB7XG4gIHJlcXVpcmVzOiBbXCJvcHRJblRpbWVQZXJpb2RcIl0sXG4gIGNyZWF0ZTogcGFyYW1zID0+IHtcbiAgICB2ZXJpZnlQYXJhbXMoXCJyb2NyXCIsIHBhcmFtcyk7XG5cbiAgICByZXR1cm4gZGF0YSA9PlxuICAgICAgZXhlY3V0ZSh7XG4gICAgICAgIGluZGljYXRvcjogdHVsaW5kLmluZGljYXRvcnMucm9jcixcbiAgICAgICAgaW5wdXRzOiBbZGF0YS5jbG9zZV0sXG4gICAgICAgIG9wdGlvbnM6IFtwYXJhbXMub3B0SW5UaW1lUGVyaW9kXSxcbiAgICAgICAgcmVzdWx0czogW1wicmVzdWx0XCJdXG4gICAgICB9KTtcbiAgfVxufTtcblxubWV0aG9kcy5yc2kgPSB7XG4gIHJlcXVpcmVzOiBbXCJvcHRJblRpbWVQZXJpb2RcIl0sXG4gIGNyZWF0ZTogcGFyYW1zID0+IHtcbiAgICB2ZXJpZnlQYXJhbXMoXCJyc2lcIiwgcGFyYW1zKTtcblxuICAgIHJldHVybiBkYXRhID0+XG4gICAgICBleGVjdXRlKHtcbiAgICAgICAgaW5kaWNhdG9yOiB0dWxpbmQuaW5kaWNhdG9ycy5yc2ksXG4gICAgICAgIGlucHV0czogW2RhdGEuY2xvc2VdLFxuICAgICAgICBvcHRpb25zOiBbcGFyYW1zLm9wdEluVGltZVBlcmlvZF0sXG4gICAgICAgIHJlc3VsdHM6IFtcInJlc3VsdFwiXVxuICAgICAgfSk7XG4gIH1cbn07XG5cbm1ldGhvZHMuc21hID0ge1xuICByZXF1aXJlczogW1wib3B0SW5UaW1lUGVyaW9kXCJdLFxuICBjcmVhdGU6IHBhcmFtcyA9PiB7XG4gICAgdmVyaWZ5UGFyYW1zKFwic21hXCIsIHBhcmFtcyk7XG5cbiAgICByZXR1cm4gZGF0YSA9PlxuICAgICAgZXhlY3V0ZSh7XG4gICAgICAgIGluZGljYXRvcjogdHVsaW5kLmluZGljYXRvcnMuc21hLFxuICAgICAgICBpbnB1dHM6IFtkYXRhLmNsb3NlXSxcbiAgICAgICAgb3B0aW9uczogW3BhcmFtcy5vcHRJblRpbWVQZXJpb2RdLFxuICAgICAgICByZXN1bHRzOiBbXCJyZXN1bHRcIl1cbiAgICAgIH0pO1xuICB9XG59O1xuXG5tZXRob2RzLnN0ZGRldiA9IHtcbiAgcmVxdWlyZXM6IFtcIm9wdEluVGltZVBlcmlvZFwiXSxcbiAgY3JlYXRlOiBwYXJhbXMgPT4ge1xuICAgIHZlcmlmeVBhcmFtcyhcInN0ZGRldlwiLCBwYXJhbXMpO1xuXG4gICAgcmV0dXJuIGRhdGEgPT5cbiAgICAgIGV4ZWN1dGUoe1xuICAgICAgICBpbmRpY2F0b3I6IHR1bGluZC5pbmRpY2F0b3JzLnN0ZGRldixcbiAgICAgICAgaW5wdXRzOiBbZGF0YS5jbG9zZV0sXG4gICAgICAgIG9wdGlvbnM6IFtwYXJhbXMub3B0SW5UaW1lUGVyaW9kXSxcbiAgICAgICAgcmVzdWx0czogW1wicmVzdWx0XCJdXG4gICAgICB9KTtcbiAgfVxufTtcblxubWV0aG9kcy5zdG9jaCA9IHtcbiAgcmVxdWlyZXM6IFtcIm9wdEluRmFzdEtQZXJpb2RcIiwgXCJvcHRJblNsb3dLUGVyaW9kXCIsIFwib3B0SW5TbG93RFBlcmlvZFwiXSxcbiAgY3JlYXRlOiBwYXJhbXMgPT4ge1xuICAgIHZlcmlmeVBhcmFtcyhcInN0b2NoXCIsIHBhcmFtcyk7XG5cbiAgICByZXR1cm4gZGF0YSA9PlxuICAgICAgZXhlY3V0ZSh7XG4gICAgICAgIGluZGljYXRvcjogdHVsaW5kLmluZGljYXRvcnMuc3RvY2gsXG4gICAgICAgIGlucHV0czogW2RhdGEuaGlnaCwgZGF0YS5sb3csIGRhdGEuY2xvc2VdLFxuICAgICAgICBvcHRpb25zOiBbXG4gICAgICAgICAgcGFyYW1zLm9wdEluRmFzdEtQZXJpb2QsXG4gICAgICAgICAgcGFyYW1zLm9wdEluU2xvd0tQZXJpb2QsXG4gICAgICAgICAgcGFyYW1zLm9wdEluU2xvd0RQZXJpb2RcbiAgICAgICAgXSxcbiAgICAgICAgcmVzdWx0czogW1wic3RvY2hLXCIsIFwic3RvY2hEXCJdXG4gICAgICB9KTtcbiAgfVxufTtcblxubWV0aG9kcy5zdW0gPSB7XG4gIHJlcXVpcmVzOiBbXCJvcHRJblRpbWVQZXJpb2RcIl0sXG4gIGNyZWF0ZTogcGFyYW1zID0+IHtcbiAgICB2ZXJpZnlQYXJhbXMoXCJzdW1cIiwgcGFyYW1zKTtcblxuICAgIHJldHVybiBkYXRhID0+XG4gICAgICBleGVjdXRlKHtcbiAgICAgICAgaW5kaWNhdG9yOiB0dWxpbmQuaW5kaWNhdG9ycy5zdW0sXG4gICAgICAgIGlucHV0czogW2RhdGEuY2xvc2VdLFxuICAgICAgICBvcHRpb25zOiBbcGFyYW1zLm9wdEluVGltZVBlcmlvZF0sXG4gICAgICAgIHJlc3VsdHM6IFtcInJlc3VsdFwiXVxuICAgICAgfSk7XG4gIH1cbn07XG5cbm1ldGhvZHMudGVtYSA9IHtcbiAgcmVxdWlyZXM6IFtcIm9wdEluVGltZVBlcmlvZFwiXSxcbiAgY3JlYXRlOiBwYXJhbXMgPT4ge1xuICAgIHZlcmlmeVBhcmFtcyhcInRlbWFcIiwgcGFyYW1zKTtcblxuICAgIHJldHVybiBkYXRhID0+XG4gICAgICBleGVjdXRlKHtcbiAgICAgICAgaW5kaWNhdG9yOiB0dWxpbmQuaW5kaWNhdG9ycy50ZW1hLFxuICAgICAgICBpbnB1dHM6IFtkYXRhLmNsb3NlXSxcbiAgICAgICAgb3B0aW9uczogW3BhcmFtcy5vcHRJblRpbWVQZXJpb2RdLFxuICAgICAgICByZXN1bHRzOiBbXCJyZXN1bHRcIl1cbiAgICAgIH0pO1xuICB9XG59O1xuXG5tZXRob2RzLnRyID0ge1xuICByZXF1aXJlczogW10sXG4gIGNyZWF0ZTogcGFyYW1zID0+IHtcbiAgICB2ZXJpZnlQYXJhbXMoXCJ0clwiLCBwYXJhbXMpO1xuXG4gICAgcmV0dXJuIGRhdGEgPT5cbiAgICAgIGV4ZWN1dGUoe1xuICAgICAgICBpbmRpY2F0b3I6IHR1bGluZC5pbmRpY2F0b3JzLnRyLFxuICAgICAgICBpbnB1dHM6IFtkYXRhLmhpZ2gsIGRhdGEubG93LCBkYXRhLmNsb3NlXSxcbiAgICAgICAgb3B0aW9uczogW10sXG4gICAgICAgIHJlc3VsdHM6IFtcInJlc3VsdFwiXVxuICAgICAgfSk7XG4gIH1cbn07XG5cbm1ldGhvZHMudHJpbWEgPSB7XG4gIHJlcXVpcmVzOiBbXCJvcHRJblRpbWVQZXJpb2RcIl0sXG4gIGNyZWF0ZTogcGFyYW1zID0+IHtcbiAgICB2ZXJpZnlQYXJhbXMoXCJ0cmltYVwiLCBwYXJhbXMpO1xuXG4gICAgcmV0dXJuIGRhdGEgPT5cbiAgICAgIGV4ZWN1dGUoe1xuICAgICAgICBpbmRpY2F0b3I6IHR1bGluZC5pbmRpY2F0b3JzLnRyaW1hLFxuICAgICAgICBpbnB1dHM6IFtkYXRhLmNsb3NlXSxcbiAgICAgICAgb3B0aW9uczogW3BhcmFtcy5vcHRJblRpbWVQZXJpb2RdLFxuICAgICAgICByZXN1bHRzOiBbXCJyZXN1bHRcIl1cbiAgICAgIH0pO1xuICB9XG59O1xuXG5tZXRob2RzLnRyaXggPSB7XG4gIHJlcXVpcmVzOiBbXCJvcHRJblRpbWVQZXJpb2RcIl0sXG4gIGNyZWF0ZTogcGFyYW1zID0+IHtcbiAgICB2ZXJpZnlQYXJhbXMoXCJ0cml4XCIsIHBhcmFtcyk7XG5cbiAgICByZXR1cm4gZGF0YSA9PlxuICAgICAgZXhlY3V0ZSh7XG4gICAgICAgIGluZGljYXRvcjogdHVsaW5kLmluZGljYXRvcnMudHJpeCxcbiAgICAgICAgaW5wdXRzOiBbZGF0YS5jbG9zZV0sXG4gICAgICAgIG9wdGlvbnM6IFtwYXJhbXMub3B0SW5UaW1lUGVyaW9kXSxcbiAgICAgICAgcmVzdWx0czogW1wicmVzdWx0XCJdXG4gICAgICB9KTtcbiAgfVxufTtcblxubWV0aG9kcy50c2YgPSB7XG4gIHJlcXVpcmVzOiBbXCJvcHRJblRpbWVQZXJpb2RcIl0sXG4gIGNyZWF0ZTogcGFyYW1zID0+IHtcbiAgICB2ZXJpZnlQYXJhbXMoXCJ0c2ZcIiwgcGFyYW1zKTtcblxuICAgIHJldHVybiBkYXRhID0+XG4gICAgICBleGVjdXRlKHtcbiAgICAgICAgaW5kaWNhdG9yOiB0dWxpbmQuaW5kaWNhdG9ycy50c2YsXG4gICAgICAgIGlucHV0czogW2RhdGEuY2xvc2VdLFxuICAgICAgICBvcHRpb25zOiBbcGFyYW1zLm9wdEluVGltZVBlcmlvZF0sXG4gICAgICAgIHJlc3VsdHM6IFtcInJlc3VsdFwiXVxuICAgICAgfSk7XG4gIH1cbn07XG5cbm1ldGhvZHMudHlwcHJpY2UgPSB7XG4gIHJlcXVpcmVzOiBbXSxcbiAgY3JlYXRlOiBwYXJhbXMgPT4ge1xuICAgIHZlcmlmeVBhcmFtcyhcInR5cHByaWNlXCIsIHBhcmFtcyk7XG5cbiAgICByZXR1cm4gZGF0YSA9PlxuICAgICAgZXhlY3V0ZSh7XG4gICAgICAgIGluZGljYXRvcjogdHVsaW5kLmluZGljYXRvcnMudHlwcHJpY2UsXG4gICAgICAgIGlucHV0czogW2RhdGEuaGlnaCwgZGF0YS5sb3csIGRhdGEuY2xvc2VdLFxuICAgICAgICBvcHRpb25zOiBbXSxcbiAgICAgICAgcmVzdWx0czogW1wicmVzdWx0XCJdXG4gICAgICB9KTtcbiAgfVxufTtcblxubWV0aG9kcy51bHRvc2MgPSB7XG4gIHJlcXVpcmVzOiBbXCJvcHRJblRpbWVQZXJpb2QxXCIsIFwib3B0SW5UaW1lUGVyaW9kMlwiLCBcIm9wdEluVGltZVBlcmlvZDNcIl0sXG4gIGNyZWF0ZTogcGFyYW1zID0+IHtcbiAgICB2ZXJpZnlQYXJhbXMoXCJ1bHRvc2NcIiwgcGFyYW1zKTtcblxuICAgIHJldHVybiBkYXRhID0+XG4gICAgICBleGVjdXRlKHtcbiAgICAgICAgaW5kaWNhdG9yOiB0dWxpbmQuaW5kaWNhdG9ycy51bHRvc2MsXG4gICAgICAgIGlucHV0czogW2RhdGEuaGlnaCwgZGF0YS5sb3csIGRhdGEuY2xvc2VdLFxuICAgICAgICBvcHRpb25zOiBbXG4gICAgICAgICAgcGFyYW1zLm9wdEluVGltZVBlcmlvZDEsXG4gICAgICAgICAgcGFyYW1zLm9wdEluVGltZVBlcmlvZDIsXG4gICAgICAgICAgcGFyYW1zLm9wdEluVGltZVBlcmlvZDNcbiAgICAgICAgXSxcbiAgICAgICAgcmVzdWx0czogW1wicmVzdWx0XCJdXG4gICAgICB9KTtcbiAgfVxufTtcblxubWV0aG9kcy52aGYgPSB7XG4gIHJlcXVpcmVzOiBbXCJvcHRJblRpbWVQZXJpb2RcIl0sXG4gIGNyZWF0ZTogcGFyYW1zID0+IHtcbiAgICB2ZXJpZnlQYXJhbXMoXCJ2aGZcIiwgcGFyYW1zKTtcblxuICAgIHJldHVybiBkYXRhID0+XG4gICAgICBleGVjdXRlKHtcbiAgICAgICAgaW5kaWNhdG9yOiB0dWxpbmQuaW5kaWNhdG9ycy52aGYsXG4gICAgICAgIGlucHV0czogW2RhdGEuY2xvc2VdLFxuICAgICAgICBvcHRpb25zOiBbcGFyYW1zLm9wdEluVGltZVBlcmlvZF0sXG4gICAgICAgIHJlc3VsdHM6IFtcInJlc3VsdFwiXVxuICAgICAgfSk7XG4gIH1cbn07XG5cbm1ldGhvZHMudmlkeWEgPSB7XG4gIHJlcXVpcmVzOiBbXCJvcHRJbkZhc3RQZXJpb2RcIiwgXCJvcHRJblNsb3dQZXJpb2RcIiwgXCJvcHRJbkFscGhhXCJdLFxuICBjcmVhdGU6IHBhcmFtcyA9PiB7XG4gICAgdmVyaWZ5UGFyYW1zKFwidmlkeWFcIiwgcGFyYW1zKTtcblxuICAgIHJldHVybiBkYXRhID0+XG4gICAgICBleGVjdXRlKHtcbiAgICAgICAgaW5kaWNhdG9yOiB0dWxpbmQuaW5kaWNhdG9ycy52aWR5YSxcbiAgICAgICAgaW5wdXRzOiBbZGF0YS5jbG9zZV0sXG4gICAgICAgIG9wdGlvbnM6IFtcbiAgICAgICAgICBwYXJhbXMub3B0SW5GYXN0UGVyaW9kLFxuICAgICAgICAgIHBhcmFtcy5vcHRJblNsb3dQZXJpb2QsXG4gICAgICAgICAgcGFyYW1zLm9wdEluQWxwaGFcbiAgICAgICAgXSxcbiAgICAgICAgcmVzdWx0czogW1wicmVzdWx0XCJdXG4gICAgICB9KTtcbiAgfVxufTtcblxubWV0aG9kcy52b2xhdGlsaXR5ID0ge1xuICByZXF1aXJlczogW1wib3B0SW5UaW1lUGVyaW9kXCJdLFxuICBjcmVhdGU6IHBhcmFtcyA9PiB7XG4gICAgdmVyaWZ5UGFyYW1zKFwidm9sYXRpbGl0eVwiLCBwYXJhbXMpO1xuXG4gICAgcmV0dXJuIGRhdGEgPT5cbiAgICAgIGV4ZWN1dGUoe1xuICAgICAgICBpbmRpY2F0b3I6IHR1bGluZC5pbmRpY2F0b3JzLnZvbGF0aWxpdHksXG4gICAgICAgIGlucHV0czogW2RhdGEuY2xvc2VdLFxuICAgICAgICBvcHRpb25zOiBbcGFyYW1zLm9wdEluVGltZVBlcmlvZF0sXG4gICAgICAgIHJlc3VsdHM6IFtcInJlc3VsdFwiXVxuICAgICAgfSk7XG4gIH1cbn07XG5cbm1ldGhvZHMudm9zYyA9IHtcbiAgcmVxdWlyZXM6IFtcIm9wdEluRmFzdFBlcmlvZFwiLCBcIm9wdEluU2xvd1BlcmlvZFwiXSxcbiAgY3JlYXRlOiBwYXJhbXMgPT4ge1xuICAgIHZlcmlmeVBhcmFtcyhcInZvc2NcIiwgcGFyYW1zKTtcblxuICAgIHJldHVybiBkYXRhID0+XG4gICAgICBleGVjdXRlKHtcbiAgICAgICAgaW5kaWNhdG9yOiB0dWxpbmQuaW5kaWNhdG9ycy52b3NjLFxuICAgICAgICBpbnB1dHM6IFtkYXRhLnZvbHVtZV0sXG4gICAgICAgIG9wdGlvbnM6IFtwYXJhbXMub3B0SW5GYXN0UGVyaW9kLCBwYXJhbXMub3B0SW5TbG93UGVyaW9kXSxcbiAgICAgICAgcmVzdWx0czogW1wicmVzdWx0XCJdXG4gICAgICB9KTtcbiAgfVxufTtcblxubWV0aG9kcy52d21hID0ge1xuICByZXF1aXJlczogW1wib3B0SW5UaW1lUGVyaW9kXCJdLFxuICBjcmVhdGU6IHBhcmFtcyA9PiB7XG4gICAgdmVyaWZ5UGFyYW1zKFwidndtYVwiLCBwYXJhbXMpO1xuXG4gICAgcmV0dXJuIGRhdGEgPT5cbiAgICAgIGV4ZWN1dGUoe1xuICAgICAgICBpbmRpY2F0b3I6IHR1bGluZC5pbmRpY2F0b3JzLnZ3bWEsXG4gICAgICAgIGlucHV0czogW2RhdGEuY2xvc2UsIGRhdGEudm9sdW1lXSxcbiAgICAgICAgb3B0aW9uczogW3BhcmFtcy5vcHRJblRpbWVQZXJpb2RdLFxuICAgICAgICByZXN1bHRzOiBbXCJyZXN1bHRcIl1cbiAgICAgIH0pO1xuICB9XG59O1xuXG5tZXRob2RzLndhZCA9IHtcbiAgcmVxdWlyZXM6IFtdLFxuICBjcmVhdGU6IHBhcmFtcyA9PiB7XG4gICAgdmVyaWZ5UGFyYW1zKFwid2FkXCIsIHBhcmFtcyk7XG5cbiAgICByZXR1cm4gZGF0YSA9PlxuICAgICAgZXhlY3V0ZSh7XG4gICAgICAgIGluZGljYXRvcjogdHVsaW5kLmluZGljYXRvcnMud2FkLFxuICAgICAgICBpbnB1dHM6IFtkYXRhLmhpZ2gsIGRhdGEubG93LCBkYXRhLmNsb3NlXSxcbiAgICAgICAgb3B0aW9uczogW10sXG4gICAgICAgIHJlc3VsdHM6IFtcInJlc3VsdFwiXVxuICAgICAgfSk7XG4gIH1cbn07XG5cbm1ldGhvZHMud2NwcmljZSA9IHtcbiAgcmVxdWlyZXM6IFtdLFxuICBjcmVhdGU6IHBhcmFtcyA9PiB7XG4gICAgdmVyaWZ5UGFyYW1zKFwid2NwcmljZVwiLCBwYXJhbXMpO1xuXG4gICAgcmV0dXJuIGRhdGEgPT5cbiAgICAgIGV4ZWN1dGUoe1xuICAgICAgICBpbmRpY2F0b3I6IHR1bGluZC5pbmRpY2F0b3JzLndjcHJpY2UsXG4gICAgICAgIGlucHV0czogW2RhdGEuaGlnaCwgZGF0YS5sb3csIGRhdGEuY2xvc2VdLFxuICAgICAgICBvcHRpb25zOiBbXSxcbiAgICAgICAgcmVzdWx0czogW1wicmVzdWx0XCJdXG4gICAgICB9KTtcbiAgfVxufTtcblxubWV0aG9kcy53aWxkZXJzID0ge1xuICByZXF1aXJlczogW1wib3B0SW5UaW1lUGVyaW9kXCJdLFxuICBjcmVhdGU6IHBhcmFtcyA9PiB7XG4gICAgdmVyaWZ5UGFyYW1zKFwid2lsZGVyc1wiLCBwYXJhbXMpO1xuXG4gICAgcmV0dXJuIGRhdGEgPT5cbiAgICAgIGV4ZWN1dGUoe1xuICAgICAgICBpbmRpY2F0b3I6IHR1bGluZC5pbmRpY2F0b3JzLndpbGRlcnMsXG4gICAgICAgIGlucHV0czogW2RhdGEuY2xvc2VdLFxuICAgICAgICBvcHRpb25zOiBbcGFyYW1zLm9wdEluVGltZVBlcmlvZF0sXG4gICAgICAgIHJlc3VsdHM6IFtcInJlc3VsdFwiXVxuICAgICAgfSk7XG4gIH1cbn07XG5cbm1ldGhvZHMud2lsbHIgPSB7XG4gIHJlcXVpcmVzOiBbXCJvcHRJblRpbWVQZXJpb2RcIl0sXG4gIGNyZWF0ZTogcGFyYW1zID0+IHtcbiAgICB2ZXJpZnlQYXJhbXMoXCJ3aWxsclwiLCBwYXJhbXMpO1xuXG4gICAgcmV0dXJuIGRhdGEgPT5cbiAgICAgIGV4ZWN1dGUoe1xuICAgICAgICBpbmRpY2F0b3I6IHR1bGluZC5pbmRpY2F0b3JzLndpbGxyLFxuICAgICAgICBpbnB1dHM6IFtkYXRhLmhpZ2gsIGRhdGEubG93LCBkYXRhLmNsb3NlXSxcbiAgICAgICAgb3B0aW9uczogW3BhcmFtcy5vcHRJblRpbWVQZXJpb2RdLFxuICAgICAgICByZXN1bHRzOiBbXCJyZXN1bHRcIl1cbiAgICAgIH0pO1xuICB9XG59O1xuXG5tZXRob2RzLndtYSA9IHtcbiAgcmVxdWlyZXM6IFtcIm9wdEluVGltZVBlcmlvZFwiXSxcbiAgY3JlYXRlOiBwYXJhbXMgPT4ge1xuICAgIHZlcmlmeVBhcmFtcyhcIndtYVwiLCBwYXJhbXMpO1xuXG4gICAgcmV0dXJuIGRhdGEgPT5cbiAgICAgIGV4ZWN1dGUoe1xuICAgICAgICBpbmRpY2F0b3I6IHR1bGluZC5pbmRpY2F0b3JzLndtYSxcbiAgICAgICAgaW5wdXRzOiBbZGF0YS5jbG9zZV0sXG4gICAgICAgIG9wdGlvbnM6IFtwYXJhbXMub3B0SW5UaW1lUGVyaW9kXSxcbiAgICAgICAgcmVzdWx0czogW1wicmVzdWx0XCJdXG4gICAgICB9KTtcbiAgfVxufTtcblxubWV0aG9kcy56bGVtYSA9IHtcbiAgcmVxdWlyZXM6IFtcIm9wdEluVGltZVBlcmlvZFwiXSxcbiAgY3JlYXRlOiBwYXJhbXMgPT4ge1xuICAgIHZlcmlmeVBhcmFtcyhcInpsZW1hXCIsIHBhcmFtcyk7XG5cbiAgICByZXR1cm4gZGF0YSA9PlxuICAgICAgZXhlY3V0ZSh7XG4gICAgICAgIGluZGljYXRvcjogdHVsaW5kLmluZGljYXRvcnMuemxlbWEsXG4gICAgICAgIGlucHV0czogW2RhdGEuY2xvc2VdLFxuICAgICAgICBvcHRpb25zOiBbcGFyYW1zLm9wdEluVGltZVBlcmlvZF0sXG4gICAgICAgIHJlc3VsdHM6IFtcInJlc3VsdFwiXVxuICAgICAgfSk7XG4gIH1cbn07XG5cbmV4cG9ydCBkZWZhdWx0IG1ldGhvZHM7XG4iLCJpbXBvcnQgQmFzZUluZGljYXRvciBmcm9tIFwiLi4vLi4vYWR2aXNlci9iYXNlSW5kaWNhdG9yXCI7XG5pbXBvcnQgdHVsaXAgZnJvbSBcIi4vY3JlYXRlXCI7XG5cbmNsYXNzIFR1bGlwIGV4dGVuZHMgQmFzZUluZGljYXRvciB7XG4gIGNvbnN0cnVjdG9yKHN0YXRlKSB7XG4gICAgc3VwZXIoc3RhdGUpO1xuXG4gICAgdGhpcy5jYWxjdWxhdGUgPSB0dWxpcFtzdGF0ZS5pbmRpY2F0b3JOYW1lXS5jcmVhdGUoc3RhdGUub3B0aW9ucyk7XG4gIH1cblxuICBhc3luYyBjYWxjKCkge1xuICAgIHRyeSB7XG4gICAgICB0aGlzLmxvZyhcIkNBTENcIik7XG4gICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCB0aGlzLmNhbGN1bGF0ZSh0aGlzLmNhbmRsZXNQcm9wcyk7XG4gICAgICB0aGlzLmxvZyhcInJlc3VsdFwiLCByZXN1bHQpO1xuICAgICAgY29uc3QgcmVzdWx0S2V5cyA9IE9iamVjdC5rZXlzKHJlc3VsdCk7XG4gICAgICBpZiAocmVzdWx0S2V5cy5sZW5ndGggPiAwKSB7XG4gICAgICAgIHJlc3VsdEtleXMuZm9yRWFjaChrZXkgPT4ge1xuICAgICAgICAgIHRoaXNba2V5XSA9IHJlc3VsdFtrZXldO1xuICAgICAgICB9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMucmVzdWx0ID0gcmVzdWx0O1xuICAgICAgfVxuICAgICAgdGhpcy5sb2coXCJ0aGlzLnJlc3VsdFwiLCB0aGlzLnJlc3VsdCk7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIHRoaXMuX2NvbnRleHQubG9nLmVycm9yKGVycm9yKTtcbiAgICAgIHRocm93IGVycm9yO1xuICAgIH1cbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBUdWxpcDtcbiIsInZhciBtYXAgPSB7XG5cdFwiLi9TVFJfUk9CT1RfMVwiOiBcIi4vc3JjL3N0cmF0ZWdpZXMvU1RSX1JPQk9UXzEuanNcIixcblx0XCIuL1NUUl9ST0JPVF8xLmpzXCI6IFwiLi9zcmMvc3RyYXRlZ2llcy9TVFJfUk9CT1RfMS5qc1wiLFxuXHRcIi4vU1RSX1JPQk9UXzJcIjogXCIuL3NyYy9zdHJhdGVnaWVzL1NUUl9ST0JPVF8yLmpzXCIsXG5cdFwiLi9TVFJfUk9CT1RfMi5qc1wiOiBcIi4vc3JjL3N0cmF0ZWdpZXMvU1RSX1JPQk9UXzIuanNcIlxufTtcblxuXG5mdW5jdGlvbiB3ZWJwYWNrQ29udGV4dChyZXEpIHtcblx0dmFyIGlkID0gd2VicGFja0NvbnRleHRSZXNvbHZlKHJlcSk7XG5cdHJldHVybiBfX3dlYnBhY2tfcmVxdWlyZV9fKGlkKTtcbn1cbmZ1bmN0aW9uIHdlYnBhY2tDb250ZXh0UmVzb2x2ZShyZXEpIHtcblx0dmFyIGlkID0gbWFwW3JlcV07XG5cdGlmKCEoaWQgKyAxKSkgeyAvLyBjaGVjayBmb3IgbnVtYmVyIG9yIHN0cmluZ1xuXHRcdHZhciBlID0gbmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIiArIHJlcSArIFwiJ1wiKTtcblx0XHRlLmNvZGUgPSAnTU9EVUxFX05PVF9GT1VORCc7XG5cdFx0dGhyb3cgZTtcblx0fVxuXHRyZXR1cm4gaWQ7XG59XG53ZWJwYWNrQ29udGV4dC5rZXlzID0gZnVuY3Rpb24gd2VicGFja0NvbnRleHRLZXlzKCkge1xuXHRyZXR1cm4gT2JqZWN0LmtleXMobWFwKTtcbn07XG53ZWJwYWNrQ29udGV4dC5yZXNvbHZlID0gd2VicGFja0NvbnRleHRSZXNvbHZlO1xubW9kdWxlLmV4cG9ydHMgPSB3ZWJwYWNrQ29udGV4dDtcbndlYnBhY2tDb250ZXh0LmlkID0gXCIuL3NyYy9zdHJhdGVnaWVzIHN5bmMgcmVjdXJzaXZlIF5cXFxcLlxcXFwvLiokXCI7IiwiY29uc3QgU3RyUm9ib3QxID0ge1xuICB1c2VyRGVmaW5lZEZ1bmMoKSB7XG4gICAgdGhpcy5sb2codGhpcy51c2VyRGVmaW5lZFZhcik7XG4gIH0sXG4gIGluaXQoKSB7XG4gICAgdGhpcy5sb2coXCJpbml0XCIpO1xuICAgIHRoaXMudXNlckRlZmluZWRWYXIgPSBcInRlc3RcIjtcbiAgICB0aGlzLm15SW5pdGlhbFZhciA9IHtcbiAgICAgIHNvbWU6IFwidmFsdWVcIlxuICAgIH07XG4gICAgdGhpcy5hZGRJbmRpY2F0b3IoXCJNeUVNQVwiLCBcIkVNQVwiLCB7IHdlaWdodDogMSB9KTtcbiAgfSxcbiAgY2hlY2soKSB7XG4gICAgdGhpcy5sb2coXCJjaGVja1wiKTtcbiAgICB0aGlzLmxvZyh0aGlzLmNhbmRsZSk7XG4gICAgdGhpcy5sb2codGhpcy51c2VyRGVmaW5lZFZhcik7XG4gICAgdGhpcy5sb2codGhpcy5pbmRpY2F0b3JzLk15RU1BLnJlc3VsdCk7XG4gICAgdGhpcy51c2VyRGVmaW5lZEZ1bmMoKTtcbiAgICBjb25zdCBuZXdTaWduYWwgPSB7XG4gICAgICBhbGVydFRpbWU6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcsXG4gICAgICBhY3Rpb246IFwibG9uZ1wiLFxuICAgICAgcXR5OiAxLFxuICAgICAgb3JkZXJUeXBlOiBcInN0b3BcIixcbiAgICAgIHByaWNlOiAxMTExLFxuICAgICAgcHJpY2VTb3VyY2U6IFwiY2xvc2VcIixcbiAgICAgIHBvc2l0aW9uSWQ6IDExLFxuICAgICAgcGFyYW1zOiB7XG4gICAgICAgIHNsaXBwYWdlU3RlcDogMTEsXG4gICAgICAgIHZvbHVtZTogMVxuICAgICAgfVxuICAgIH07XG4gICAgdGhpcy5hZHZpY2UobmV3U2lnbmFsKTtcbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBTdHJSb2JvdDE7XG4iLCJjb25zdCBTdHJSb2JvdDIgPSB7XG4gIGluaXQoKSB7XG4gICAgdGhpcy5sb2coXCJpbml0XCIpO1xuICAgIHRoaXMudXNlckRlZmluZWRWYXIgPSBcInRlc3RcIjtcbiAgICB0aGlzLm15SW5pdGlhbFZhciA9IHtcbiAgICAgIHNvbWU6IFwidmFsdWVcIlxuICAgIH07XG4gICAgdGhpcy5hZGRUdWxpcEluZGljYXRvcihcIm15RU1BXCIsIFwiZW1hXCIsIHsgb3B0SW5UaW1lUGVyaW9kOiAxMCB9KTtcbiAgfSxcbiAgY2hlY2soKSB7XG4gICAgdGhpcy5sb2coXCJjaGVja1wiKTtcbiAgICB0aGlzLmxvZyh0aGlzLmNhbmRsZSk7XG4gICAgdGhpcy5sb2codGhpcy5pbmRpY2F0b3JzLm15RU1BLnJlc3VsdCk7XG4gICAgY29uc3QgbmV3U2lnbmFsID0ge1xuICAgICAgYWxlcnRUaW1lOiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nLFxuICAgICAgYWN0aW9uOiBcImxvbmdcIixcbiAgICAgIHF0eTogMixcbiAgICAgIG9yZGVyVHlwZTogXCJzdG9wXCIsXG4gICAgICBwcmljZTogdGhpcy5pbmRpY2F0b3JzLm15RU1BLnJlc3VsdCxcbiAgICAgIHByaWNlU291cmNlOiBcImNsb3NlXCIsXG4gICAgICBwb3NpdGlvbklkOiAyMixcbiAgICAgIHBhcmFtczoge1xuICAgICAgICBzbGlwcGFnZVN0ZXA6IDIyLFxuICAgICAgICB2b2x1bWU6IDJcbiAgICAgIH1cbiAgICB9O1xuICAgIHRoaXMuYWR2aWNlKG5ld1NpZ25hbCk7XG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gU3RyUm9ib3QyO1xuIiwiaW1wb3J0IGF6dXJlIGZyb20gXCJhenVyZS1zdG9yYWdlXCI7XG5pbXBvcnQgeyBTVEFUVVNfU1RBUlRFRCwgU1RBVFVTX0JVU1kgfSBmcm9tIFwiY3B6U3RhdGVcIjtcbmltcG9ydCB7XG4gIFNUT1JBR0VfQURWSVNFUlNfVEFCTEUsXG4gIFNUT1JBR0VfQ0FORExFU1BFTkRJTkdfVEFCTEUsXG4gIFNUT1JBR0VfQ0FORExFU0NBQ0hFRF9UQUJMRVxufSBmcm9tIFwiY3B6U3RvcmFnZVRhYmxlc1wiO1xuaW1wb3J0IHtcbiAgY3JlYXRlVGFibGVJZk5vdEV4aXN0cyxcbiAgaW5zZXJ0T3JNZXJnZUVudGl0eSxcbiAgbWVyZ2VFbnRpdHksXG4gIGRlbGV0ZUVudGl0eSxcbiAgcXVlcnlFbnRpdGllc1xufSBmcm9tIFwiLi9zdG9yYWdlXCI7XG5pbXBvcnQgeyBvYmplY3RUb0VudGl0eSwgZW50aXR5VG9PYmplY3QsIGNyZWF0ZVNsdWcgfSBmcm9tIFwiLi91dGlsc1wiO1xuXG5jb25zdCB7IFRhYmxlUXVlcnksIFRhYmxlVXRpbGl0aWVzIH0gPSBhenVyZTtcbmNvbnN0IHsgZW50aXR5R2VuZXJhdG9yIH0gPSBUYWJsZVV0aWxpdGllcztcblxuLy8g0KHQvtC30LTQsNGC0Ywg0YLQsNCx0LvQuNGG0Ysg0LXRgdC70Lgg0L3QtSDRgdGD0YnQtdGB0YLQstGD0Y7RglxuY3JlYXRlVGFibGVJZk5vdEV4aXN0cyhTVE9SQUdFX0FEVklTRVJTX1RBQkxFKTtcbmNyZWF0ZVRhYmxlSWZOb3RFeGlzdHMoU1RPUkFHRV9DQU5ETEVTUEVORElOR19UQUJMRSk7XG5cbi8qKlxuICog0KHQvtGF0YDQsNC90LXQvdC40LUg0YHQvtGB0YLQvtGP0L3QuNGPINGB0L7QstC10YLQvdC40LrQsFxuICpcbiAqIEBwYXJhbSB7Kn0gY29udGV4dFxuICogQHBhcmFtIHsqfSBzdGF0ZVxuICogQHJldHVybnNcbiAqL1xuYXN5bmMgZnVuY3Rpb24gc2F2ZUFkdmlzZXJTdGF0ZShjb250ZXh0LCBzdGF0ZSkge1xuICB0cnkge1xuICAgIGNvbnN0IGVudGl0eSA9IHtcbiAgICAgIFBhcnRpdGlvbktleTogZW50aXR5R2VuZXJhdG9yLlN0cmluZyhcbiAgICAgICAgY3JlYXRlU2x1ZyhzdGF0ZS5leGNoYW5nZSwgc3RhdGUuYXNzZXQsIHN0YXRlLmN1cnJlbmN5LCBzdGF0ZS50aW1lZnJhbWUpXG4gICAgICApLFxuICAgICAgUm93S2V5OiBlbnRpdHlHZW5lcmF0b3IuU3RyaW5nKHN0YXRlLnRhc2tJZCksXG4gICAgICAuLi5vYmplY3RUb0VudGl0eShzdGF0ZSlcbiAgICB9O1xuICAgIGNvbnN0IGVudGl0eVVwZGF0ZWQgPSBhd2FpdCBpbnNlcnRPck1lcmdlRW50aXR5KFxuICAgICAgU1RPUkFHRV9BRFZJU0VSU19UQUJMRSxcbiAgICAgIGVudGl0eVxuICAgICk7XG4gICAgcmV0dXJuIHsgaXNTdWNjZXNzOiBlbnRpdHlVcGRhdGVkIH07XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgY29udGV4dC5sb2cuZXJyb3IoZXJyb3IpO1xuICAgIHJldHVybiB7IGlzU3VjY2VzczogZmFsc2UsIGVycm9yIH07XG4gIH1cbn1cblxuLyoqXG4gKiDQodC+0YXRgNCw0L3QtdC90LjQtSDRgdCy0LXRh9C10Lkg0L7QttC40LTQsNGO0YnQuNGFINC+0LHRgNCw0LHQvtGC0LrQuFxuICpcbiAqIEBwYXJhbSB7Kn0gY29udGV4dFxuICogQHBhcmFtIHsqfSBjYW5kbGVcbiAqIEByZXR1cm5zXG4gKi9cbmFzeW5jIGZ1bmN0aW9uIHNhdmVQZW5kaW5nQ2FuZGxlcyhjb250ZXh0LCBjYW5kbGUpIHtcbiAgdHJ5IHtcbiAgICBjb25zdCBlbnRpdHkgPSB7XG4gICAgICBQYXJ0aXRpb25LZXk6IGVudGl0eUdlbmVyYXRvci5TdHJpbmcoY2FuZGxlLnRhc2tJZCksXG4gICAgICBSb3dLZXk6IGVudGl0eUdlbmVyYXRvci5TdHJpbmcoY2FuZGxlLmlkLnRvU3RyaW5nKCkpLFxuICAgICAgLi4ub2JqZWN0VG9FbnRpdHkoY2FuZGxlKVxuICAgIH07XG4gICAgY29uc3QgZW50aXR5VXBkYXRlZCA9IGF3YWl0IGluc2VydE9yTWVyZ2VFbnRpdHkoXG4gICAgICBTVE9SQUdFX0NBTkRMRVNQRU5ESU5HX1RBQkxFLFxuICAgICAgZW50aXR5XG4gICAgKTtcbiAgICByZXR1cm4geyBpc1N1Y2Nlc3M6IGVudGl0eVVwZGF0ZWQsIHRhc2tJZDogY2FuZGxlLnRhc2tJZCB9O1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGNvbnRleHQubG9nLmVycm9yKGVycm9yKTtcbiAgICByZXR1cm4geyBpc1N1Y2Nlc3M6IGZhbHNlLCBlcnJvciB9O1xuICB9XG59XG5cbi8qKlxuICog0J7QsdC90L7QstC70LXQvdC40LUg0YHQvtGB0YLQvtGP0L3QuNGPINGB0L7QstC10YLQvdC40LrQsFxuICpcbiAqIEBwYXJhbSB7Kn0gY29udGV4dFxuICogQHBhcmFtIHsqfSBzdGF0ZVxuICogQHJldHVybnNcbiAqL1xuYXN5bmMgZnVuY3Rpb24gdXBkYXRlQWR2aXNlclN0YXRlKGNvbnRleHQsIHN0YXRlKSB7XG4gIHRyeSB7XG4gICAgY29uc3QgZW50aXR5ID0ge1xuICAgICAgLi4ub2JqZWN0VG9FbnRpdHkoc3RhdGUpXG4gICAgfTtcbiAgICBjb25zdCBlbnRpdHlVcGRhdGVkID0gYXdhaXQgbWVyZ2VFbnRpdHkoU1RPUkFHRV9BRFZJU0VSU19UQUJMRSwgZW50aXR5KTtcbiAgICByZXR1cm4geyBpc1N1Y2Nlc3M6IGVudGl0eVVwZGF0ZWQgfTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBjb250ZXh0LmxvZy5lcnJvcihlcnJvcik7XG4gICAgcmV0dXJuIHsgaXNTdWNjZXNzOiBmYWxzZSwgZXJyb3IgfTtcbiAgfVxufVxuXG4vKipcbiAqINCj0LTQsNC70LXQvdC40LUg0YHQstC10YfQuCDQvtC20LjQtNCw0Y7RidC10Lkg0LLRi9C/0L7Qu9C90LXQvdC40Y9cbiAqXG4gKiBAcGFyYW0geyp9IGNvbnRleHRcbiAqIEBwYXJhbSB7Kn0gY2FuZGxlXG4gKiBAcmV0dXJuc1xuICovXG5hc3luYyBmdW5jdGlvbiBkZWxldGVQZW5kaW5nQ2FuZGxlcyhjb250ZXh0LCBjYW5kbGUpIHtcbiAgdHJ5IHtcbiAgICBjb25zdCBlbnRpdHkgPSB7XG4gICAgICBQYXJ0aXRpb25LZXk6IGVudGl0eUdlbmVyYXRvci5TdHJpbmcoY2FuZGxlLnRhc2tJZCksXG4gICAgICBSb3dLZXk6IGVudGl0eUdlbmVyYXRvci5TdHJpbmcoY2FuZGxlLmlkLnRvU3RyaW5nKCkpLFxuICAgICAgLi4ub2JqZWN0VG9FbnRpdHkoY2FuZGxlKVxuICAgIH07XG4gICAgY29uc3QgZW50aXR5RGVsZXRlZCA9IGF3YWl0IGRlbGV0ZUVudGl0eShcbiAgICAgIFNUT1JBR0VfQ0FORExFU1BFTkRJTkdfVEFCTEUsXG4gICAgICBlbnRpdHlcbiAgICApO1xuICAgIHJldHVybiB7IGlzU3VjY2VzczogZW50aXR5RGVsZXRlZCB9O1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGNvbnRleHQubG9nLmVycm9yKGVycm9yKTtcbiAgICByZXR1cm4geyBpc1N1Y2Nlc3M6IGZhbHNlLCBlcnJvciB9O1xuICB9XG59XG5cbi8qKlxuICog0J/QvtC40YHQuiDRgdC+0LLQtdGC0L3QuNC60LAg0L/QviDRg9C90LjQutCw0LvRjNC90L7QvNGDINC60LvRjtGH0YNcbiAqXG4gKiBAcGFyYW0geyp9IGNvbnRleHRcbiAqIEBwYXJhbSB7b2JqZWN0fSBrZXlzXG4gKiBAcmV0dXJuc1xuICovXG5hc3luYyBmdW5jdGlvbiBnZXRBZHZpc2VyQnlLZXkoY29udGV4dCwga2V5cykge1xuICB0cnkge1xuICAgIGNvbnN0IHJvd0tleUZpbHRlciA9IFRhYmxlUXVlcnkuc3RyaW5nRmlsdGVyKFxuICAgICAgXCJSb3dLZXlcIixcbiAgICAgIFRhYmxlVXRpbGl0aWVzLlF1ZXJ5Q29tcGFyaXNvbnMuRVFVQUwsXG4gICAgICBrZXlzLnJvd0tleVxuICAgICk7XG4gICAgY29uc3QgcGFydGl0aW9uS2V5RmlsdGVyID0gVGFibGVRdWVyeS5zdHJpbmdGaWx0ZXIoXG4gICAgICBcIlBhcnRpdGlvbktleVwiLFxuICAgICAgVGFibGVVdGlsaXRpZXMuUXVlcnlDb21wYXJpc29ucy5FUVVBTCxcbiAgICAgIGtleXMucGFydGl0aW9uS2V5XG4gICAgKTtcbiAgICBjb25zdCBxdWVyeSA9IG5ldyBUYWJsZVF1ZXJ5KCkud2hlcmUoXG4gICAgICBUYWJsZVF1ZXJ5LmNvbWJpbmVGaWx0ZXJzKFxuICAgICAgICByb3dLZXlGaWx0ZXIsXG4gICAgICAgIFRhYmxlVXRpbGl0aWVzLlRhYmxlT3BlcmF0b3JzLkFORCxcbiAgICAgICAgcGFydGl0aW9uS2V5RmlsdGVyXG4gICAgICApXG4gICAgKTtcbiAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBxdWVyeUVudGl0aWVzKFNUT1JBR0VfQURWSVNFUlNfVEFCTEUsIHF1ZXJ5KTtcbiAgICBjb25zdCBlbnRpdGllcyA9IFtdO1xuICAgIGlmIChyZXN1bHQpIHtcbiAgICAgIHJlc3VsdC5lbnRyaWVzLmZvckVhY2goZWxlbWVudCA9PiB7XG4gICAgICAgIGVudGl0aWVzLnB1c2goZW50aXR5VG9PYmplY3QoZWxlbWVudCkpO1xuICAgICAgfSk7XG4gICAgfVxuICAgIHJldHVybiB7IGlzU3VjY2VzczogdHJ1ZSwgZGF0YTogZW50aXRpZXNbMF0gfTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBjb250ZXh0LmxvZy5lcnJvcihlcnJvciwga2V5cyk7XG4gICAgcmV0dXJuIHsgaXNTdWNjZXNzOiBmYWxzZSwgZXJyb3IgfTtcbiAgfVxufVxuXG4vKipcbiAqINCf0L7QuNGB0Log0LfQsNC/0YPRidC10L3QvdGL0YUg0LjQu9C4INC30LDQvdGP0YLRi9GFINGB0L7QstC10YLQvdC40LrQvtCyINC/0L4g0LHQuNGA0LbQtSvQuNC90YHRgtGA0YPQvNC10L3RgtGDK9GC0LDQudC80YTRgNC10LnQvNGDXG4gKlxuICogQHBhcmFtIHsqfSBjb250ZXh0XG4gKiBAcGFyYW0ge3N0cmluZ30gc2x1Z1xuICogQHJldHVybnNcbiAqL1xuYXN5bmMgZnVuY3Rpb24gZ2V0QWR2aXNlcnNCeVNsdWcoY29udGV4dCwgc2x1Zykge1xuICB0cnkge1xuICAgIGNvbnN0IHBhcnRpdGlvbktleUZpbHRlciA9IFRhYmxlUXVlcnkuc3RyaW5nRmlsdGVyKFxuICAgICAgXCJQYXJ0aXRpb25LZXlcIixcbiAgICAgIFRhYmxlVXRpbGl0aWVzLlF1ZXJ5Q29tcGFyaXNvbnMuRVFVQUwsXG4gICAgICBzbHVnXG4gICAgKTtcbiAgICBjb25zdCBzdGFydGVkU3RhdHVzRmlsdGVyID0gVGFibGVRdWVyeS5zdHJpbmdGaWx0ZXIoXG4gICAgICBcInN0YXR1c1wiLFxuICAgICAgVGFibGVVdGlsaXRpZXMuUXVlcnlDb21wYXJpc29ucy5FUVVBTCxcbiAgICAgIFNUQVRVU19TVEFSVEVEXG4gICAgKTtcbiAgICBjb25zdCBidWR5U3RhdHVzRmlsdGVyID0gVGFibGVRdWVyeS5zdHJpbmdGaWx0ZXIoXG4gICAgICBcInN0YXR1c1wiLFxuICAgICAgVGFibGVVdGlsaXRpZXMuUXVlcnlDb21wYXJpc29ucy5FUVVBTCxcbiAgICAgIFNUQVRVU19CVVNZXG4gICAgKTtcbiAgICBjb25zdCBzdGF0dXNGaWx0ZXIgPSBUYWJsZVF1ZXJ5LmNvbWJpbmVGaWx0ZXJzKFxuICAgICAgc3RhcnRlZFN0YXR1c0ZpbHRlcixcbiAgICAgIFRhYmxlVXRpbGl0aWVzLlRhYmxlT3BlcmF0b3JzLk9SLFxuICAgICAgYnVkeVN0YXR1c0ZpbHRlclxuICAgICk7XG4gICAgY29uc3QgcXVlcnkgPSBuZXcgVGFibGVRdWVyeSgpLndoZXJlKFxuICAgICAgVGFibGVRdWVyeS5jb21iaW5lRmlsdGVycyhcbiAgICAgICAgcGFydGl0aW9uS2V5RmlsdGVyLFxuICAgICAgICBUYWJsZVV0aWxpdGllcy5UYWJsZU9wZXJhdG9ycy5BTkQsXG4gICAgICAgIHN0YXR1c0ZpbHRlclxuICAgICAgKVxuICAgICk7XG4gICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgcXVlcnlFbnRpdGllcyhTVE9SQUdFX0FEVklTRVJTX1RBQkxFLCBxdWVyeSk7XG4gICAgY29uc3QgZW50aXRpZXMgPSBbXTtcbiAgICBpZiAocmVzdWx0KSB7XG4gICAgICByZXN1bHQuZW50cmllcy5mb3JFYWNoKGVsZW1lbnQgPT4ge1xuICAgICAgICBlbnRpdGllcy5wdXNoKGVudGl0eVRvT2JqZWN0KGVsZW1lbnQpKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgICByZXR1cm4geyBpc1N1Y2Nlc3M6IHRydWUsIGRhdGE6IGVudGl0aWVzIH07XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgY29udGV4dC5sb2cuZXJyb3IoZXJyb3IsIHNsdWcpO1xuICAgIHJldHVybiB7IGlzU3VjY2VzczogZmFsc2UsIGVycm9yIH07XG4gIH1cbn1cblxuLyoqXG4gKiDQntGC0LHQvtGAINC30LDQutC10YjQuNGA0L7QstCw0L3QvdGL0Lcg0YHQstC10YfQtdC5INC/0L4g0LrQu9GO0YfRg1xuICpcbiAqIEBwYXJhbSB7Kn0gY29udGV4dFxuICogQHBhcmFtIHtzdHJpbmd9IGtleVxuICogQHJldHVybnNcbiAqL1xuYXN5bmMgZnVuY3Rpb24gZ2V0Q2FjaGVkQ2FuZGxlc0J5S2V5KGNvbnRleHQsIGtleSwgbGltaXQpIHtcbiAgdHJ5IHtcbiAgICBjb25zdCBxdWVyeSA9IG5ldyBUYWJsZVF1ZXJ5KClcbiAgICAgIC53aGVyZShcbiAgICAgICAgVGFibGVRdWVyeS5zdHJpbmdGaWx0ZXIoXG4gICAgICAgICAgXCJQYXJ0aXRpb25LZXlcIixcbiAgICAgICAgICBUYWJsZVV0aWxpdGllcy5RdWVyeUNvbXBhcmlzb25zLkVRVUFMLFxuICAgICAgICAgIGtleVxuICAgICAgICApXG4gICAgICApXG4gICAgICAudG9wKGxpbWl0KTtcbiAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBxdWVyeUVudGl0aWVzKFNUT1JBR0VfQ0FORExFU0NBQ0hFRF9UQUJMRSwgcXVlcnkpO1xuICAgIGNvbnN0IGVudGl0aWVzID0gW107XG4gICAgaWYgKHJlc3VsdCkge1xuICAgICAgcmVzdWx0LmVudHJpZXMuZm9yRWFjaChlbGVtZW50ID0+IHtcbiAgICAgICAgZW50aXRpZXMucHVzaChlbnRpdHlUb09iamVjdChlbGVtZW50KSk7XG4gICAgICB9KTtcbiAgICB9XG4gICAgcmV0dXJuIHsgaXNTdWNjZXNzOiB0cnVlLCBkYXRhOiBlbnRpdGllcyB9O1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGNvbnRleHQubG9nLmVycm9yKGVycm9yLCBrZXkpO1xuICAgIHJldHVybiB7IGlzU3VjY2VzczogZmFsc2UsIGVycm9yIH07XG4gIH1cbn1cblxuLyoqXG4gKiDQn9C+0LjRgdC6INGB0LLQtdGH0LXQuSDQvtC20LjQtNCw0Y7RidC40YUg0L7QsdGA0LDQsdC+0YLQutC4INC00LvRjyDQutC+0L3QutGA0LXRgtC90L7Qs9C+INGB0L7QstC10YLQvdC40LrQsFxuICpcbiAqIEBwYXJhbSB7Kn0gY29udGV4dFxuICogQHBhcmFtIHtzdHJpbmd9IGlkXG4gKiBAcmV0dXJuc1xuICovXG5hc3luYyBmdW5jdGlvbiBnZXRQZW5kaW5nQ2FuZGxlc0J5QWR2aXNlcklkKGNvbnRleHQsIGlkKSB7XG4gIHRyeSB7XG4gICAgY29uc3QgcXVlcnkgPSBuZXcgVGFibGVRdWVyeSgpLndoZXJlKFxuICAgICAgVGFibGVRdWVyeS5zdHJpbmdGaWx0ZXIoXG4gICAgICAgIFwiUGFydGl0aW9uS2V5XCIsXG4gICAgICAgIFRhYmxlVXRpbGl0aWVzLlF1ZXJ5Q29tcGFyaXNvbnMuRVFVQUwsXG4gICAgICAgIGlkXG4gICAgICApXG4gICAgKTtcbiAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBxdWVyeUVudGl0aWVzKFNUT1JBR0VfQ0FORExFU1BFTkRJTkdfVEFCTEUsIHF1ZXJ5KTtcbiAgICBjb25zdCBlbnRpdGllcyA9IFtdO1xuICAgIGlmIChyZXN1bHQpIHtcbiAgICAgIHJlc3VsdC5lbnRyaWVzLmZvckVhY2goZWxlbWVudCA9PiB7XG4gICAgICAgIGVudGl0aWVzLnB1c2goZW50aXR5VG9PYmplY3QoZWxlbWVudCkpO1xuICAgICAgfSk7XG4gICAgfVxuICAgIHJldHVybiB7IGlzU3VjY2VzczogdHJ1ZSwgZGF0YTogZW50aXRpZXMgfTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBjb250ZXh0LmxvZy5lcnJvcihlcnJvciwgaWQpO1xuICAgIHJldHVybiB7IGlzU3VjY2VzczogZmFsc2UsIGVycm9yIH07XG4gIH1cbn1cbmV4cG9ydCB7XG4gIHNhdmVBZHZpc2VyU3RhdGUsXG4gIHNhdmVQZW5kaW5nQ2FuZGxlcyxcbiAgdXBkYXRlQWR2aXNlclN0YXRlLFxuICBkZWxldGVQZW5kaW5nQ2FuZGxlcyxcbiAgZ2V0QWR2aXNlckJ5S2V5LFxuICBnZXRBZHZpc2Vyc0J5U2x1ZyxcbiAgZ2V0Q2FjaGVkQ2FuZGxlc0J5S2V5LFxuICBnZXRQZW5kaW5nQ2FuZGxlc0J5QWR2aXNlcklkXG59O1xuIiwiLy8gVE9ETzogTW92ZSB0byBodHRwczovL2dpdGh1Yi5jb20vQXp1cmUvYXp1cmUtc3RvcmFnZS1qcyB3aGVuIGF2YWlsYWJsZVxuaW1wb3J0IGF6dXJlIGZyb20gXCJhenVyZS1zdG9yYWdlXCI7XG5cbmNvbnN0IHRhYmxlU2VydmljZSA9IGF6dXJlLmNyZWF0ZVRhYmxlU2VydmljZShwcm9jZXNzLmVudi5BWl9TVE9SQUdFX0NTKTtcbi8qKlxuICog0KHQvtC30LTQsNC90LjQtSDRgtCw0LHQu9C40YbRiyDQtdGB0LvQuCDQtdGJ0LUg0L3QtSDRgdGD0YnQtdGB0YLQstGD0LXRglxuICpcbiAqIEBwYXJhbSB7Kn0gdGFibGVOYW1lXG4gKiBAcmV0dXJuc1xuICovXG5mdW5jdGlvbiBjcmVhdGVUYWJsZUlmTm90RXhpc3RzKHRhYmxlTmFtZSkge1xuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgIHRhYmxlU2VydmljZS5jcmVhdGVUYWJsZUlmTm90RXhpc3RzKHRhYmxlTmFtZSwgKGVycm9yLCByZXN1bHQpID0+IHtcbiAgICAgIGlmIChlcnJvcikgcmVqZWN0KGVycm9yKTtcblxuICAgICAgcmVzb2x2ZShyZXN1bHQpO1xuICAgIH0pO1xuICB9KTtcbn1cblxuLyoqXG4gKiDQlNC+0LHQsNCy0LvQtdC90LjQtSDQuNC70Lgg0L7QsdC90L7QstC70LXQvdC40LUg0LfQsNC/0LjRgdC4INCyINGC0LDQsdC70LjRhtC1XG4gKlxuICogQHBhcmFtIHsqfSB0YWJsZU5hbWVcbiAqIEBwYXJhbSB7Kn0gZW50aXR5XG4gKiBAcmV0dXJuc1xuICovXG5mdW5jdGlvbiBpbnNlcnRPck1lcmdlRW50aXR5KHRhYmxlTmFtZSwgZW50aXR5KSB7XG4gIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgdGFibGVTZXJ2aWNlLmluc2VydE9yTWVyZ2VFbnRpdHkodGFibGVOYW1lLCBlbnRpdHksIGVycm9yID0+IHtcbiAgICAgIGlmIChlcnJvcikgcmVqZWN0KGVycm9yKTtcbiAgICAgIHJlc29sdmUodHJ1ZSk7XG4gICAgfSk7XG4gIH0pO1xufVxuXG4vKipcbiAqINCe0LHQvdC+0LLQu9C10L3QuNC1INC30LDQv9C40YHQuCDQsiDRgtCw0LHQu9C40YbQtVxuICpcbiAqIEBwYXJhbSB7Kn0gdGFibGVOYW1lXG4gKiBAcGFyYW0geyp9IGVudGl0eVxuICogQHJldHVybnNcbiAqL1xuZnVuY3Rpb24gbWVyZ2VFbnRpdHkodGFibGVOYW1lLCBlbnRpdHkpIHtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICB0YWJsZVNlcnZpY2UubWVyZ2VFbnRpdHkodGFibGVOYW1lLCBlbnRpdHksIGVycm9yID0+IHtcbiAgICAgIGlmIChlcnJvcikgcmVqZWN0KGVycm9yKTtcbiAgICAgIHJlc29sdmUodHJ1ZSk7XG4gICAgfSk7XG4gIH0pO1xufVxuXG4vKipcbiAqINCj0LTQsNC70LXQvdC40LUg0LfQsNC/0LjRgdC4INC40Lcg0YLQsNCx0LvQuNGG0YtcbiAqXG4gKiBAcGFyYW0geyp9IHRhYmxlTmFtZVxuICogQHBhcmFtIHsqfSBlbnRpdHlcbiAqIEByZXR1cm5zXG4gKi9cbmZ1bmN0aW9uIGRlbGV0ZUVudGl0eSh0YWJsZU5hbWUsIGVudGl0eSkge1xuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgIHRhYmxlU2VydmljZS5kZWxldGVFbnRpdHkodGFibGVOYW1lLCBlbnRpdHksIGVycm9yID0+IHtcbiAgICAgIGlmIChlcnJvcikgcmVqZWN0KGVycm9yKTtcbiAgICAgIHJlc29sdmUodHJ1ZSk7XG4gICAgfSk7XG4gIH0pO1xufVxuLyoqXG4gKiDQktGL0LHQvtGA0LrQsCDQtNCw0L3QvdGL0YUg0LjQtyDRgtCw0LHQu9C40YbRi1xuICpcbiAqIEBwYXJhbSB7Kn0gdGFibGVOYW1lXG4gKiBAcGFyYW0geyp9IHRhYmxlUXVlcnlcbiAqIEByZXR1cm5zXG4gKi9cbmZ1bmN0aW9uIHF1ZXJ5RW50aXRpZXModGFibGVOYW1lLCB0YWJsZVF1ZXJ5KSB7XG4gIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgdGFibGVTZXJ2aWNlLnF1ZXJ5RW50aXRpZXModGFibGVOYW1lLCB0YWJsZVF1ZXJ5LCBudWxsLCAoZXJyb3IsIHJlc3VsdCkgPT4ge1xuICAgICAgaWYgKGVycm9yKSByZWplY3QoZXJyb3IpO1xuICAgICAgcmVzb2x2ZShyZXN1bHQpO1xuICAgIH0pO1xuICB9KTtcbn1cbmV4cG9ydCB7XG4gIGNyZWF0ZVRhYmxlSWZOb3RFeGlzdHMsXG4gIGluc2VydE9yTWVyZ2VFbnRpdHksXG4gIG1lcmdlRW50aXR5LFxuICBkZWxldGVFbnRpdHksXG4gIHF1ZXJ5RW50aXRpZXNcbn07XG4iLCJpbXBvcnQgeyBUYWJsZVV0aWxpdGllcyB9IGZyb20gXCJhenVyZS1zdG9yYWdlXCI7XG5cbmNvbnN0IHsgZW50aXR5R2VuZXJhdG9yIH0gPSBUYWJsZVV0aWxpdGllcztcblxuZnVuY3Rpb24gdHJ5UGFyc2VKU09OKGpzb25TdHJpbmcpIHtcbiAgdHJ5IHtcbiAgICBjb25zdCBvID0gSlNPTi5wYXJzZShqc29uU3RyaW5nKTtcbiAgICBpZiAobyAmJiB0eXBlb2YgbyA9PT0gXCJvYmplY3RcIikge1xuICAgICAgcmV0dXJuIG87XG4gICAgfVxuICB9IGNhdGNoIChlKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIHJldHVybiBmYWxzZTtcbn1cbi8qKlxuICog0J/RgNC10L7QsdGA0LDQt9C+0LLRi9Cy0LDQtdGCINC+0LHRitC10LrRgiDRgtC40L/QsCBBenVyZSBUYWJsZSBTdG9yYWdlIEVudGl0eSDQsiDQvtCx0YvRh9C90YvQuSDQvtCx0YrQtdC60YIgSlNcbiAqXG4gKiBAcGFyYW0ge2VudGl0eX0gZW50aXR5XG4gKiBAcmV0dXJucyB7b2JqZWN0fVxuICovXG5mdW5jdGlvbiBlbnRpdHlUb09iamVjdChlbnRpdHkpIHtcbiAgY29uc3Qgb2JqZWN0ID0ge307XG4gIE9iamVjdC5rZXlzKGVudGl0eSkuZm9yRWFjaChrZXkgPT4ge1xuICAgIGlmIChrZXkgPT09IFwiLm1ldGFkYXRhXCIpIHJldHVybjtcbiAgICBjb25zdCBqc29uID0gdHJ5UGFyc2VKU09OKGVudGl0eVtrZXldLl8pO1xuICAgIGlmIChqc29uKSB7XG4gICAgICBvYmplY3Rba2V5XSA9IGpzb247XG4gICAgfSBlbHNlIHtcbiAgICAgIG9iamVjdFtrZXldID0gZW50aXR5W2tleV0uXztcbiAgICB9XG4gIH0pO1xuICByZXR1cm4gb2JqZWN0O1xufVxuLyoqXG4gKiDQn9GA0LXQvtCx0YDQsNC30L7QstGL0LLQsNC10YIg0L7QsdGL0YfQvdGL0Lkg0L7QsdGK0LXQutGCIEpTINCyINC+0LHRitC10LrRgiDRgtC40L/QsCBBenVyZSBUYWJsZSBTdG9yYWdlIEVudGl0eVxuICpcbiAqIEBwYXJhbSB7b2JqZWN0fSBvYmplY3RcbiAqIEByZXR1cm5zIHtlbnRpdHl9XG4gKi9cbmZ1bmN0aW9uIG9iamVjdFRvRW50aXR5KG9iamVjdCkge1xuICBjb25zdCBlbnRpdHkgPSB7fTtcbiAgT2JqZWN0LmtleXMob2JqZWN0KS5mb3JFYWNoKGtleSA9PiB7XG4gICAgY29uc3QgZWxlbWVudCA9IG9iamVjdFtrZXldO1xuICAgIGlmICh0eXBlb2YgZWxlbWVudCA9PT0gXCJvYmplY3RcIikge1xuICAgICAgaWYgKGVsZW1lbnQgaW5zdGFuY2VvZiBEYXRlKSB7XG4gICAgICAgIGVudGl0eVtrZXldID0gZW50aXR5R2VuZXJhdG9yLkRhdGVUaW1lKGVsZW1lbnQpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZW50aXR5W2tleV0gPSBlbnRpdHlHZW5lcmF0b3IuU3RyaW5nKEpTT04uc3RyaW5naWZ5KGVsZW1lbnQpKTtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBlbGVtZW50ID09PSBcIm51bWJlclwiKSB7XG4gICAgICBlbnRpdHlba2V5XSA9IGVudGl0eUdlbmVyYXRvci5Eb3VibGUoZWxlbWVudCk7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgZWxlbWVudCA9PT0gXCJib29sZWFuXCIpIHtcbiAgICAgIGVudGl0eVtrZXldID0gZW50aXR5R2VuZXJhdG9yLkJvb2xlYW4oZWxlbWVudCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGVudGl0eVtrZXldID0gZW50aXR5R2VuZXJhdG9yLlN0cmluZyhlbGVtZW50KTtcbiAgICB9XG4gIH0pO1xuICByZXR1cm4gZW50aXR5O1xufVxuXG5mdW5jdGlvbiBjcmVhdGVTbHVnKGV4Y2hhbmdlLCBhc3NldCwgY3VycmVuY3ksIHRpbWVmcmFtZSkge1xuICByZXR1cm4gYCR7ZXhjaGFuZ2V9LiR7YXNzZXR9LiR7Y3VycmVuY3l9LiR7dGltZWZyYW1lfWA7XG59XG5cbmV4cG9ydCB7IHRyeVBhcnNlSlNPTiwgZW50aXR5VG9PYmplY3QsIG9iamVjdFRvRW50aXR5LCBjcmVhdGVTbHVnIH07XG4iLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJAYmFiZWwvcnVudGltZS9oZWxwZXJzL2FzeW5jVG9HZW5lcmF0b3JcIik7IiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwiQGJhYmVsL3J1bnRpbWUvaGVscGVycy9jbGFzc0NhbGxDaGVja1wiKTsiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJAYmFiZWwvcnVudGltZS9oZWxwZXJzL2NyZWF0ZUNsYXNzXCIpOyIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcIkBiYWJlbC9ydW50aW1lL2hlbHBlcnMvZ2V0UHJvdG90eXBlT2ZcIik7IiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwiQGJhYmVsL3J1bnRpbWUvaGVscGVycy9pbmhlcml0c1wiKTsiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJAYmFiZWwvcnVudGltZS9oZWxwZXJzL29iamVjdFNwcmVhZFwiKTsiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJAYmFiZWwvcnVudGltZS9oZWxwZXJzL3Bvc3NpYmxlQ29uc3RydWN0b3JSZXR1cm5cIik7IiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwiQGJhYmVsL3J1bnRpbWUvaGVscGVycy90eXBlb2ZcIik7IiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwiQGJhYmVsL3J1bnRpbWUvcmVnZW5lcmF0b3JcIik7IiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwiYXp1cmUtZXZlbnRncmlkXCIpOyIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcImF6dXJlLXN0b3JhZ2VcIik7IiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwiZGF5anNcIik7IiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwibXMtcmVzdC1henVyZVwiKTsiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJ0dWxpbmRcIik7IiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwidXJsXCIpOyIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcInV1aWRcIik7Il0sInNvdXJjZVJvb3QiOiIifQ==