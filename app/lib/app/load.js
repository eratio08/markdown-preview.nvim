"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const node_fs_1 = tslib_1.__importDefault(require("node:fs"));
const node_module_1 = tslib_1.__importDefault(require("node:module"));
const node_path_1 = tslib_1.__importDefault(require("node:path"));
const node_vm_1 = tslib_1.__importDefault(require("node:vm"));
const preloadmodules_1 = tslib_1.__importDefault(require("./preloadmodules"));
function load(scriptPath) {
    const userModule = new node_module_1.default(scriptPath);
    userModule.filename = scriptPath;
    userModule.paths = node_module_1.default._nodeModulePaths(node_path_1.default.dirname(scriptPath));
    const moduleCode = node_fs_1.default.readFileSync(userModule.filename, 'utf-8');
    userModule.require = userModule.require.bind(userModule);
    const sanbox = node_vm_1.default.createContext(Object.assign(Object.assign({}, global), { exports: userModule.exports, module: userModule, require: (name) => {
            if (preloadmodules_1.default[name]) {
                return preloadmodules_1.default[name];
            }
            try {
                return userModule.require(name);
            }
            catch (_e) {
                let loadScript = node_path_1.default.join(node_path_1.default.dirname(scriptPath), name);
                if (node_fs_1.default.existsSync(loadScript) &&
                    node_fs_1.default.statSync(loadScript).isDirectory()) {
                    loadScript = node_path_1.default.join(loadScript, 'index.js');
                }
                else if (!node_fs_1.default.existsSync(loadScript)) {
                    loadScript = `${loadScript}.js`;
                }
                return load(loadScript);
            }
        }, __filename: userModule.filename, __dirname: node_path_1.default.dirname(scriptPath), process }));
    node_vm_1.default.runInContext(moduleCode, sanbox, { filename: userModule.filename });
    return userModule.exports;
}
exports.default = load;
