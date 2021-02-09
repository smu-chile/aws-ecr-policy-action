module.exports =
/******/ (function(modules, runtime) { // webpackBootstrap
/******/ 	"use strict";
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
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	__webpack_require__.ab = __dirname + "/";
/******/
/******/ 	// the startup function
/******/ 	function startup() {
/******/ 		// Load entry module and return exports
/******/ 		return __webpack_require__(198);
/******/ 	};
/******/
/******/ 	// run startup
/******/ 	return startup();
/******/ })
/************************************************************************/
/******/ ({

/***/ 9:
/***/ (function(__unusedmodule, exports, __webpack_require__) {

"use strict";

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const os = __webpack_require__(87);
const events = __webpack_require__(614);
const child = __webpack_require__(129);
/* eslint-disable @typescript-eslint/unbound-method */
const IS_WINDOWS = process.platform === 'win32';
/*
 * Class for running command line tools. Handles quoting and arg parsing in a platform agnostic way.
 */
class ToolRunner extends events.EventEmitter {
    constructor(toolPath, args, options) {
        super();
        if (!toolPath) {
            throw new Error("Parameter 'toolPath' cannot be null or empty.");
        }
        this.toolPath = toolPath;
        this.args = args || [];
        this.options = options || {};
    }
    _debug(message) {
        if (this.options.listeners && this.options.listeners.debug) {
            this.options.listeners.debug(message);
        }
    }
    _getCommandString(options, noPrefix) {
        const toolPath = this._getSpawnFileName();
        const args = this._getSpawnArgs(options);
        let cmd = noPrefix ? '' : '[command]'; // omit prefix when piped to a second tool
        if (IS_WINDOWS) {
            // Windows + cmd file
            if (this._isCmdFile()) {
                cmd += toolPath;
                for (const a of args) {
                    cmd += ` ${a}`;
                }
            }
            // Windows + verbatim
            else if (options.windowsVerbatimArguments) {
                cmd += `"${toolPath}"`;
                for (const a of args) {
                    cmd += ` ${a}`;
                }
            }
            // Windows (regular)
            else {
                cmd += this._windowsQuoteCmdArg(toolPath);
                for (const a of args) {
                    cmd += ` ${this._windowsQuoteCmdArg(a)}`;
                }
            }
        }
        else {
            // OSX/Linux - this can likely be improved with some form of quoting.
            // creating processes on Unix is fundamentally different than Windows.
            // on Unix, execvp() takes an arg array.
            cmd += toolPath;
            for (const a of args) {
                cmd += ` ${a}`;
            }
        }
        return cmd;
    }
    _processLineBuffer(data, strBuffer, onLine) {
        try {
            let s = strBuffer + data.toString();
            let n = s.indexOf(os.EOL);
            while (n > -1) {
                const line = s.substring(0, n);
                onLine(line);
                // the rest of the string ...
                s = s.substring(n + os.EOL.length);
                n = s.indexOf(os.EOL);
            }
            strBuffer = s;
        }
        catch (err) {
            // streaming lines to console is best effort.  Don't fail a build.
            this._debug(`error processing line. Failed with error ${err}`);
        }
    }
    _getSpawnFileName() {
        if (IS_WINDOWS) {
            if (this._isCmdFile()) {
                return process.env['COMSPEC'] || 'cmd.exe';
            }
        }
        return this.toolPath;
    }
    _getSpawnArgs(options) {
        if (IS_WINDOWS) {
            if (this._isCmdFile()) {
                let argline = `/D /S /C "${this._windowsQuoteCmdArg(this.toolPath)}`;
                for (const a of this.args) {
                    argline += ' ';
                    argline += options.windowsVerbatimArguments
                        ? a
                        : this._windowsQuoteCmdArg(a);
                }
                argline += '"';
                return [argline];
            }
        }
        return this.args;
    }
    _endsWith(str, end) {
        return str.endsWith(end);
    }
    _isCmdFile() {
        const upperToolPath = this.toolPath.toUpperCase();
        return (this._endsWith(upperToolPath, '.CMD') ||
            this._endsWith(upperToolPath, '.BAT'));
    }
    _windowsQuoteCmdArg(arg) {
        // for .exe, apply the normal quoting rules that libuv applies
        if (!this._isCmdFile()) {
            return this._uvQuoteCmdArg(arg);
        }
        // otherwise apply quoting rules specific to the cmd.exe command line parser.
        // the libuv rules are generic and are not designed specifically for cmd.exe
        // command line parser.
        //
        // for a detailed description of the cmd.exe command line parser, refer to
        // http://stackoverflow.com/questions/4094699/how-does-the-windows-command-interpreter-cmd-exe-parse-scripts/7970912#7970912
        // need quotes for empty arg
        if (!arg) {
            return '""';
        }
        // determine whether the arg needs to be quoted
        const cmdSpecialChars = [
            ' ',
            '\t',
            '&',
            '(',
            ')',
            '[',
            ']',
            '{',
            '}',
            '^',
            '=',
            ';',
            '!',
            "'",
            '+',
            ',',
            '`',
            '~',
            '|',
            '<',
            '>',
            '"'
        ];
        let needsQuotes = false;
        for (const char of arg) {
            if (cmdSpecialChars.some(x => x === char)) {
                needsQuotes = true;
                break;
            }
        }
        // short-circuit if quotes not needed
        if (!needsQuotes) {
            return arg;
        }
        // the following quoting rules are very similar to the rules that by libuv applies.
        //
        // 1) wrap the string in quotes
        //
        // 2) double-up quotes - i.e. " => ""
        //
        //    this is different from the libuv quoting rules. libuv replaces " with \", which unfortunately
        //    doesn't work well with a cmd.exe command line.
        //
        //    note, replacing " with "" also works well if the arg is passed to a downstream .NET console app.
        //    for example, the command line:
        //          foo.exe "myarg:""my val"""
        //    is parsed by a .NET console app into an arg array:
        //          [ "myarg:\"my val\"" ]
        //    which is the same end result when applying libuv quoting rules. although the actual
        //    command line from libuv quoting rules would look like:
        //          foo.exe "myarg:\"my val\""
        //
        // 3) double-up slashes that precede a quote,
        //    e.g.  hello \world    => "hello \world"
        //          hello\"world    => "hello\\""world"
        //          hello\\"world   => "hello\\\\""world"
        //          hello world\    => "hello world\\"
        //
        //    technically this is not required for a cmd.exe command line, or the batch argument parser.
        //    the reasons for including this as a .cmd quoting rule are:
        //
        //    a) this is optimized for the scenario where the argument is passed from the .cmd file to an
        //       external program. many programs (e.g. .NET console apps) rely on the slash-doubling rule.
        //
        //    b) it's what we've been doing previously (by deferring to node default behavior) and we
        //       haven't heard any complaints about that aspect.
        //
        // note, a weakness of the quoting rules chosen here, is that % is not escaped. in fact, % cannot be
        // escaped when used on the command line directly - even though within a .cmd file % can be escaped
        // by using %%.
        //
        // the saving grace is, on the command line, %var% is left as-is if var is not defined. this contrasts
        // the line parsing rules within a .cmd file, where if var is not defined it is replaced with nothing.
        //
        // one option that was explored was replacing % with ^% - i.e. %var% => ^%var^%. this hack would
        // often work, since it is unlikely that var^ would exist, and the ^ character is removed when the
        // variable is used. the problem, however, is that ^ is not removed when %* is used to pass the args
        // to an external program.
        //
        // an unexplored potential solution for the % escaping problem, is to create a wrapper .cmd file.
        // % can be escaped within a .cmd file.
        let reverse = '"';
        let quoteHit = true;
        for (let i = arg.length; i > 0; i--) {
            // walk the string in reverse
            reverse += arg[i - 1];
            if (quoteHit && arg[i - 1] === '\\') {
                reverse += '\\'; // double the slash
            }
            else if (arg[i - 1] === '"') {
                quoteHit = true;
                reverse += '"'; // double the quote
            }
            else {
                quoteHit = false;
            }
        }
        reverse += '"';
        return reverse
            .split('')
            .reverse()
            .join('');
    }
    _uvQuoteCmdArg(arg) {
        // Tool runner wraps child_process.spawn() and needs to apply the same quoting as
        // Node in certain cases where the undocumented spawn option windowsVerbatimArguments
        // is used.
        //
        // Since this function is a port of quote_cmd_arg from Node 4.x (technically, lib UV,
        // see https://github.com/nodejs/node/blob/v4.x/deps/uv/src/win/process.c for details),
        // pasting copyright notice from Node within this function:
        //
        //      Copyright Joyent, Inc. and other Node contributors. All rights reserved.
        //
        //      Permission is hereby granted, free of charge, to any person obtaining a copy
        //      of this software and associated documentation files (the "Software"), to
        //      deal in the Software without restriction, including without limitation the
        //      rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
        //      sell copies of the Software, and to permit persons to whom the Software is
        //      furnished to do so, subject to the following conditions:
        //
        //      The above copyright notice and this permission notice shall be included in
        //      all copies or substantial portions of the Software.
        //
        //      THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
        //      IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
        //      FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
        //      AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
        //      LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
        //      FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
        //      IN THE SOFTWARE.
        if (!arg) {
            // Need double quotation for empty argument
            return '""';
        }
        if (!arg.includes(' ') && !arg.includes('\t') && !arg.includes('"')) {
            // No quotation needed
            return arg;
        }
        if (!arg.includes('"') && !arg.includes('\\')) {
            // No embedded double quotes or backslashes, so I can just wrap
            // quote marks around the whole thing.
            return `"${arg}"`;
        }
        // Expected input/output:
        //   input : hello"world
        //   output: "hello\"world"
        //   input : hello""world
        //   output: "hello\"\"world"
        //   input : hello\world
        //   output: hello\world
        //   input : hello\\world
        //   output: hello\\world
        //   input : hello\"world
        //   output: "hello\\\"world"
        //   input : hello\\"world
        //   output: "hello\\\\\"world"
        //   input : hello world\
        //   output: "hello world\\" - note the comment in libuv actually reads "hello world\"
        //                             but it appears the comment is wrong, it should be "hello world\\"
        let reverse = '"';
        let quoteHit = true;
        for (let i = arg.length; i > 0; i--) {
            // walk the string in reverse
            reverse += arg[i - 1];
            if (quoteHit && arg[i - 1] === '\\') {
                reverse += '\\';
            }
            else if (arg[i - 1] === '"') {
                quoteHit = true;
                reverse += '\\';
            }
            else {
                quoteHit = false;
            }
        }
        reverse += '"';
        return reverse
            .split('')
            .reverse()
            .join('');
    }
    _cloneExecOptions(options) {
        options = options || {};
        const result = {
            cwd: options.cwd || process.cwd(),
            env: options.env || process.env,
            silent: options.silent || false,
            windowsVerbatimArguments: options.windowsVerbatimArguments || false,
            failOnStdErr: options.failOnStdErr || false,
            ignoreReturnCode: options.ignoreReturnCode || false,
            delay: options.delay || 10000
        };
        result.outStream = options.outStream || process.stdout;
        result.errStream = options.errStream || process.stderr;
        return result;
    }
    _getSpawnOptions(options, toolPath) {
        options = options || {};
        const result = {};
        result.cwd = options.cwd;
        result.env = options.env;
        result['windowsVerbatimArguments'] =
            options.windowsVerbatimArguments || this._isCmdFile();
        if (options.windowsVerbatimArguments) {
            result.argv0 = `"${toolPath}"`;
        }
        return result;
    }
    /**
     * Exec a tool.
     * Output will be streamed to the live console.
     * Returns promise with return code
     *
     * @param     tool     path to tool to exec
     * @param     options  optional exec options.  See ExecOptions
     * @returns   number
     */
    exec() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                this._debug(`exec tool: ${this.toolPath}`);
                this._debug('arguments:');
                for (const arg of this.args) {
                    this._debug(`   ${arg}`);
                }
                const optionsNonNull = this._cloneExecOptions(this.options);
                if (!optionsNonNull.silent && optionsNonNull.outStream) {
                    optionsNonNull.outStream.write(this._getCommandString(optionsNonNull) + os.EOL);
                }
                const state = new ExecState(optionsNonNull, this.toolPath);
                state.on('debug', (message) => {
                    this._debug(message);
                });
                const fileName = this._getSpawnFileName();
                const cp = child.spawn(fileName, this._getSpawnArgs(optionsNonNull), this._getSpawnOptions(this.options, fileName));
                const stdbuffer = '';
                if (cp.stdout) {
                    cp.stdout.on('data', (data) => {
                        if (this.options.listeners && this.options.listeners.stdout) {
                            this.options.listeners.stdout(data);
                        }
                        if (!optionsNonNull.silent && optionsNonNull.outStream) {
                            optionsNonNull.outStream.write(data);
                        }
                        this._processLineBuffer(data, stdbuffer, (line) => {
                            if (this.options.listeners && this.options.listeners.stdline) {
                                this.options.listeners.stdline(line);
                            }
                        });
                    });
                }
                const errbuffer = '';
                if (cp.stderr) {
                    cp.stderr.on('data', (data) => {
                        state.processStderr = true;
                        if (this.options.listeners && this.options.listeners.stderr) {
                            this.options.listeners.stderr(data);
                        }
                        if (!optionsNonNull.silent &&
                            optionsNonNull.errStream &&
                            optionsNonNull.outStream) {
                            const s = optionsNonNull.failOnStdErr
                                ? optionsNonNull.errStream
                                : optionsNonNull.outStream;
                            s.write(data);
                        }
                        this._processLineBuffer(data, errbuffer, (line) => {
                            if (this.options.listeners && this.options.listeners.errline) {
                                this.options.listeners.errline(line);
                            }
                        });
                    });
                }
                cp.on('error', (err) => {
                    state.processError = err.message;
                    state.processExited = true;
                    state.processClosed = true;
                    state.CheckComplete();
                });
                cp.on('exit', (code) => {
                    state.processExitCode = code;
                    state.processExited = true;
                    this._debug(`Exit code ${code} received from tool '${this.toolPath}'`);
                    state.CheckComplete();
                });
                cp.on('close', (code) => {
                    state.processExitCode = code;
                    state.processExited = true;
                    state.processClosed = true;
                    this._debug(`STDIO streams have closed for tool '${this.toolPath}'`);
                    state.CheckComplete();
                });
                state.on('done', (error, exitCode) => {
                    if (stdbuffer.length > 0) {
                        this.emit('stdline', stdbuffer);
                    }
                    if (errbuffer.length > 0) {
                        this.emit('errline', errbuffer);
                    }
                    cp.removeAllListeners();
                    if (error) {
                        reject(error);
                    }
                    else {
                        resolve(exitCode);
                    }
                });
            });
        });
    }
}
exports.ToolRunner = ToolRunner;
/**
 * Convert an arg string to an array of args. Handles escaping
 *
 * @param    argString   string of arguments
 * @returns  string[]    array of arguments
 */
function argStringToArray(argString) {
    const args = [];
    let inQuotes = false;
    let escaped = false;
    let arg = '';
    function append(c) {
        // we only escape double quotes.
        if (escaped && c !== '"') {
            arg += '\\';
        }
        arg += c;
        escaped = false;
    }
    for (let i = 0; i < argString.length; i++) {
        const c = argString.charAt(i);
        if (c === '"') {
            if (!escaped) {
                inQuotes = !inQuotes;
            }
            else {
                append(c);
            }
            continue;
        }
        if (c === '\\' && escaped) {
            append(c);
            continue;
        }
        if (c === '\\' && inQuotes) {
            escaped = true;
            continue;
        }
        if (c === ' ' && !inQuotes) {
            if (arg.length > 0) {
                args.push(arg);
                arg = '';
            }
            continue;
        }
        append(c);
    }
    if (arg.length > 0) {
        args.push(arg.trim());
    }
    return args;
}
exports.argStringToArray = argStringToArray;
class ExecState extends events.EventEmitter {
    constructor(options, toolPath) {
        super();
        this.processClosed = false; // tracks whether the process has exited and stdio is closed
        this.processError = '';
        this.processExitCode = 0;
        this.processExited = false; // tracks whether the process has exited
        this.processStderr = false; // tracks whether stderr was written to
        this.delay = 10000; // 10 seconds
        this.done = false;
        this.timeout = null;
        if (!toolPath) {
            throw new Error('toolPath must not be empty');
        }
        this.options = options;
        this.toolPath = toolPath;
        if (options.delay) {
            this.delay = options.delay;
        }
    }
    CheckComplete() {
        if (this.done) {
            return;
        }
        if (this.processClosed) {
            this._setResult();
        }
        else if (this.processExited) {
            this.timeout = setTimeout(ExecState.HandleTimeout, this.delay, this);
        }
    }
    _debug(message) {
        this.emit('debug', message);
    }
    _setResult() {
        // determine whether there is an error
        let error;
        if (this.processExited) {
            if (this.processError) {
                error = new Error(`There was an error when attempting to execute the process '${this.toolPath}'. This may indicate the process failed to start. Error: ${this.processError}`);
            }
            else if (this.processExitCode !== 0 && !this.options.ignoreReturnCode) {
                error = new Error(`The process '${this.toolPath}' failed with exit code ${this.processExitCode}`);
            }
            else if (this.processStderr && this.options.failOnStdErr) {
                error = new Error(`The process '${this.toolPath}' failed because one or more lines were written to the STDERR stream`);
            }
        }
        // clear the timeout
        if (this.timeout) {
            clearTimeout(this.timeout);
            this.timeout = null;
        }
        this.done = true;
        this.emit('done', error, this.processExitCode);
    }
    static HandleTimeout(state) {
        if (state.done) {
            return;
        }
        if (!state.processClosed && state.processExited) {
            const message = `The STDIO streams did not close within ${state.delay /
                1000} seconds of the exit event from process '${state.toolPath}'. This may indicate a child process inherited the STDIO streams and has not yet exited.`;
            state._debug(message);
        }
        state._setResult();
    }
}
//# sourceMappingURL=toolrunner.js.map

/***/ }),

/***/ 87:
/***/ (function(module) {

module.exports = require("os");

/***/ }),

/***/ 129:
/***/ (function(module) {

module.exports = require("child_process");

/***/ }),

/***/ 198:
/***/ (function(__unusedmodule, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const core = __webpack_require__(470);
const exec_1 = __webpack_require__(986);
const inputs_1 = __webpack_require__(842);
async function run() {
    core.debug(':: Loading input params');
    const inputs = new inputs_1.default();
    const accountUrl = `${inputs.AwsAccountID}.dkr.ecr.${inputs.Region}.amazonaws.com`;
    // Configure AWS CLI
    awsConfigure(inputs);
    // Login to AWS ECR
    await awsEcrLogin(inputs);
    // Create ECR Repo
    await awsCreateEcrRepo(inputs);
    // Build the Dockerfile image
    await buildImage(inputs, accountUrl);
    // Deploy built image tags to AWS ECR
    await deployToEcr(inputs, accountUrl);
}
function awsConfigure(inputs) {
    core.debug(':: Setting AWS credentials');
    core.exportVariable('AWS_ACCESS_KEY_ID', inputs.AccessKeyID);
    core.exportVariable('AWS_SECRET_ACCESS_KEY', inputs.SecretAccessKey);
    core.exportVariable('AWS_DEFAULT_REGION', inputs.Region);
}
async function awsEcrLogin(inputs) {
    core.info('== LOGIN INTO AWS ECR ==');
    let loginCmd = '';
    let err = '';
    let opts = {
        cwd: './',
        silent: true,
        listeners: {
            stdout: (data) => {
                loginCmd += data.toString();
            },
            stderr: (data) => {
                err += data.toString();
            }
        },
    };
    await exec_1.exec(`aws ecr get-login --no-include-email --region ${inputs.Region}`, undefined, opts);
    if (err.length > 0) {
        throw new Error('Failed to retrieve docker login to AWS ECR. Perhaps the AWS credentials do not have the correct permission');
    }
    await exec_1.exec(loginCmd, undefined, opts);
    core.info('== FINISHED LOGIN ==');
}
function getEcrRepoName(inputs) {
    if (inputs.EcrRepoName.length > 0) {
        return inputs.EcrRepoName;
    }
    // default
    return (process.env.GITHUB_REPOSITORY || '').toLocaleLowerCase();
}
function getEcrTags(accountUrl, repoName, inputTags) {
    let tags = inputTags.split(',');
    const ecrTags = [];
    // Add the ref tag if code is a checked out release tag
    if ((process.env.GITHUB_REF || '').startsWith('refs/tags')) {
        const tag = (process.env.GITHUB_REF || '').split('/').pop();
        if (tag !== '' || tag !== undefined) {
            ecrTags.push(`${accountUrl}/${repoName}:${tag}`);
        }
    }
    // Build the tags
    for (const tag of tags) {
        ecrTags.push(`${accountUrl}/${repoName}:${tag}`);
    }
    return ecrTags;
}
async function awsCreateEcrRepo(inputs) {
    core.info('== CHECKING FOR ECR REPO ==');
    const repoName = getEcrRepoName(inputs);
    try {
        await exec_1.exec(`aws ecr describe-repositories --repository-names "${repoName}"`);
    }
    catch (_a) {
        // Repo doesn't exist or failed. Try creating if specified.
        if (inputs.ShouldCreateRepo === 'true') {
            core.info('== CREATING ECR REPO ==');
            await exec_1.exec(`aws ecr create-repository --repository-name ${repoName}`);
            core.info(`== FINISHED CREATING ECR REPO [ ${repoName} ] ==`);
            return;
        }
        else {
            core.setFailed('== ECR Repository is missing ==');
            throw new Error(`ECR repo named [ ${repoName} ] was not found. Perhaps the spelling was incorrect?`);
        }
    }
    core.info('== REPO FOUND ==');
}
async function buildImage(inputs, accountUrl) {
    core.info('== BUILD IMAGE FROM DOCKERFILE ==');
    const repoName = getEcrRepoName(inputs);
    const ecrTags = getEcrTags(accountUrl, repoName, inputs.EcrTags);
    let tags = ecrTags.join(' -t ');
    if (tags.length > 0) {
        tags = `-t ${tags}`;
    }
    await exec_1.exec(`docker build ${inputs.DockerBuildArgs} -f ${inputs.DockerfilePath} ${tags} .`, undefined, {
        cwd: inputs.ProjectPath,
    });
    core.info('== FINISHED BUILDING IMAGE ==');
}
async function deployToEcr(inputs, accountUrl) {
    core.info('== DEPLOYING TO ECR ==');
    core.debug(`:: ECR Account URL: ${accountUrl}`);
    const repoName = getEcrRepoName(inputs);
    const ecrTags = getEcrTags(accountUrl, repoName, inputs.EcrTags);
    for (const tag of ecrTags) {
        await exec_1.exec(`docker push ${tag}`);
    }
    core.info('== FINISHED DEPLOYMENT ==');
}
try {
    run();
}
catch (error) {
    core.error(error);
    core.setFailed(error.message);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9tYWluLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsc0NBQXNDO0FBQ3RDLHdDQUFxQztBQUVyQyxxQ0FBOEI7QUFFOUIsS0FBSyxVQUFVLEdBQUc7SUFDaEIsSUFBSSxDQUFDLEtBQUssQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDO0lBQ3RDLE1BQU0sTUFBTSxHQUFHLElBQUksZ0JBQU0sRUFBRSxDQUFDO0lBRTVCLE1BQU0sVUFBVSxHQUFHLEdBQUcsTUFBTSxDQUFDLFlBQVksWUFBWSxNQUFNLENBQUMsTUFBTSxnQkFBZ0IsQ0FBQztJQUVuRixvQkFBb0I7SUFDcEIsWUFBWSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBRXJCLG1CQUFtQjtJQUNuQixNQUFNLFdBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUUxQixrQkFBa0I7SUFDbEIsTUFBTSxnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUUvQiw2QkFBNkI7SUFDN0IsTUFBTSxVQUFVLENBQUMsTUFBTSxFQUFFLFVBQVUsQ0FBQyxDQUFDO0lBRXJDLHFDQUFxQztJQUNyQyxNQUFNLFdBQVcsQ0FBQyxNQUFNLEVBQUUsVUFBVSxDQUFDLENBQUM7QUFDeEMsQ0FBQztBQUVELFNBQVMsWUFBWSxDQUFDLE1BQWM7SUFDbEMsSUFBSSxDQUFDLEtBQUssQ0FBQyw0QkFBNEIsQ0FBQyxDQUFBO0lBQ3hDLElBQUksQ0FBQyxjQUFjLENBQUMsbUJBQW1CLEVBQUUsTUFBTSxDQUFDLFdBQVcsQ0FBQyxDQUFDO0lBQzdELElBQUksQ0FBQyxjQUFjLENBQUMsdUJBQXVCLEVBQUUsTUFBTSxDQUFDLGVBQWUsQ0FBQyxDQUFDO0lBQ3JFLElBQUksQ0FBQyxjQUFjLENBQUMsb0JBQW9CLEVBQUUsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQzNELENBQUM7QUFFRCxLQUFLLFVBQVUsV0FBVyxDQUFDLE1BQWM7SUFDdkMsSUFBSSxDQUFDLElBQUksQ0FBQywwQkFBMEIsQ0FBQyxDQUFBO0lBRXJDLElBQUksUUFBUSxHQUFHLEVBQUUsQ0FBQztJQUNsQixJQUFJLEdBQUcsR0FBRyxFQUFFLENBQUM7SUFFYixJQUFJLElBQUksR0FBZ0I7UUFDdEIsR0FBRyxFQUFFLElBQUk7UUFDVCxNQUFNLEVBQUUsSUFBSTtRQUNaLFNBQVMsRUFBRTtZQUNULE1BQU0sRUFBRSxDQUFDLElBQVksRUFBRSxFQUFFO2dCQUN2QixRQUFRLElBQUksSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO1lBQzlCLENBQUM7WUFDRCxNQUFNLEVBQUUsQ0FBQyxJQUFZLEVBQUUsRUFBRTtnQkFDdkIsR0FBRyxJQUFJLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztZQUN6QixDQUFDO1NBQ0Y7S0FDRixDQUFBO0lBRUQsTUFBTSxXQUFJLENBQUMsaURBQWlELE1BQU0sQ0FBQyxNQUFNLEVBQUUsRUFBRSxTQUFTLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDOUYsSUFBSSxHQUFHLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtRQUNsQixNQUFNLElBQUksS0FBSyxDQUFDLDRHQUE0RyxDQUFDLENBQUM7S0FDL0g7SUFFRCxNQUFNLFdBQUksQ0FBQyxRQUFRLEVBQUUsU0FBUyxFQUFFLElBQUksQ0FBQyxDQUFDO0lBRXRDLElBQUksQ0FBQyxJQUFJLENBQUMsc0JBQXNCLENBQUMsQ0FBQztBQUNwQyxDQUFDO0FBRUQsU0FBUyxjQUFjLENBQUMsTUFBYztJQUNwQyxJQUFJLE1BQU0sQ0FBQyxXQUFXLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtRQUNqQyxPQUFPLE1BQU0sQ0FBQyxXQUFXLENBQUM7S0FDM0I7SUFFRCxVQUFVO0lBQ1YsT0FBTyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsaUJBQWlCLElBQUksRUFBRSxDQUFDLENBQUMsaUJBQWlCLEVBQUUsQ0FBQTtBQUNsRSxDQUFDO0FBRUQsU0FBUyxVQUFVLENBQUMsVUFBa0IsRUFBRSxRQUFnQixFQUFFLFNBQWlCO0lBQ3pFLElBQUksSUFBSSxHQUFHLFNBQVMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDaEMsTUFBTSxPQUFPLEdBQWEsRUFBRSxDQUFDO0lBRTdCLHVEQUF1RDtJQUN2RCxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFVLElBQUksRUFBRSxDQUFDLENBQUMsVUFBVSxDQUFDLFdBQVcsQ0FBQyxFQUFFO1FBQzFELE1BQU0sR0FBRyxHQUFHLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFVLElBQUksRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBRTVELElBQUksR0FBRyxLQUFLLEVBQUUsSUFBSSxHQUFHLEtBQUssU0FBUyxFQUFFO1lBQ25DLE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxVQUFVLElBQUksUUFBUSxJQUFJLEdBQUcsRUFBRSxDQUFDLENBQUM7U0FDbEQ7S0FDRjtJQUVELGlCQUFpQjtJQUNqQixLQUFLLE1BQU0sR0FBRyxJQUFJLElBQUksRUFBRTtRQUN0QixPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsVUFBVSxJQUFJLFFBQVEsSUFBSSxHQUFHLEVBQUUsQ0FBQyxDQUFDO0tBQ2xEO0lBRUQsT0FBTyxPQUFPLENBQUE7QUFDaEIsQ0FBQztBQUVELEtBQUssVUFBVSxnQkFBZ0IsQ0FBQyxNQUFjO0lBQzVDLElBQUksQ0FBQyxJQUFJLENBQUMsNkJBQTZCLENBQUMsQ0FBQztJQUV6QyxNQUFNLFFBQVEsR0FBRyxjQUFjLENBQUMsTUFBTSxDQUFDLENBQUM7SUFFeEMsSUFBSTtRQUNGLE1BQU0sV0FBSSxDQUFDLHFEQUFxRCxRQUFRLEdBQUcsQ0FBQyxDQUFDO0tBQzlFO0lBQUMsV0FBTTtRQUNOLDJEQUEyRDtRQUMzRCxJQUFJLE1BQU0sQ0FBQyxnQkFBZ0IsS0FBSyxNQUFNLEVBQUU7WUFDdEMsSUFBSSxDQUFDLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDO1lBQ3JDLE1BQU0sV0FBSSxDQUFDLCtDQUErQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO1lBQ3RFLElBQUksQ0FBQyxJQUFJLENBQUMsbUNBQW1DLFFBQVEsT0FBTyxDQUFDLENBQUM7WUFDOUQsT0FBTTtTQUNQO2FBQU07WUFDTCxJQUFJLENBQUMsU0FBUyxDQUFDLGlDQUFpQyxDQUFDLENBQUM7WUFDbEQsTUFBTSxJQUFJLEtBQUssQ0FBQyxvQkFBb0IsUUFBUSx1REFBdUQsQ0FBQyxDQUFDO1NBQ3RHO0tBQ0Y7SUFFRCxJQUFJLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLENBQUE7QUFDL0IsQ0FBQztBQUVELEtBQUssVUFBVSxVQUFVLENBQUMsTUFBYyxFQUFFLFVBQWtCO0lBQzFELElBQUksQ0FBQyxJQUFJLENBQUMsbUNBQW1DLENBQUMsQ0FBQztJQUMvQyxNQUFNLFFBQVEsR0FBRyxjQUFjLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDeEMsTUFBTSxPQUFPLEdBQUcsVUFBVSxDQUFDLFVBQVUsRUFBRSxRQUFRLEVBQUUsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBRWpFLElBQUksSUFBSSxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7SUFFaEMsSUFBSSxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtRQUNuQixJQUFJLEdBQUcsTUFBTSxJQUFJLEVBQUUsQ0FBQTtLQUNwQjtJQUdELE1BQU0sV0FBSSxDQUFDLGdCQUFnQixNQUFNLENBQUMsZUFBZSxPQUFPLE1BQU0sQ0FBQyxjQUFjLElBQUksSUFBSSxJQUFJLEVBQUUsU0FBUyxFQUFFO1FBQ3BHLEdBQUcsRUFBRSxNQUFNLENBQUMsV0FBVztLQUN4QixDQUFDLENBQUM7SUFDSCxJQUFJLENBQUMsSUFBSSxDQUFDLCtCQUErQixDQUFDLENBQUM7QUFDN0MsQ0FBQztBQUVELEtBQUssVUFBVSxXQUFXLENBQUMsTUFBYyxFQUFFLFVBQWtCO0lBQzNELElBQUksQ0FBQyxJQUFJLENBQUMsd0JBQXdCLENBQUMsQ0FBQztJQUNwQyxJQUFJLENBQUMsS0FBSyxDQUFDLHVCQUF1QixVQUFVLEVBQUUsQ0FBQyxDQUFDO0lBRWhELE1BQU0sUUFBUSxHQUFHLGNBQWMsQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUN4QyxNQUFNLE9BQU8sR0FBRyxVQUFVLENBQUMsVUFBVSxFQUFFLFFBQVEsRUFBRSxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUM7SUFFakUsS0FBSyxNQUFNLEdBQUcsSUFBSSxPQUFPLEVBQUU7UUFDekIsTUFBTSxXQUFJLENBQUMsZUFBZSxHQUFHLEVBQUUsQ0FBQyxDQUFDO0tBQ2xDO0lBRUQsSUFBSSxDQUFDLElBQUksQ0FBQywyQkFBMkIsQ0FBQyxDQUFDO0FBQ3pDLENBQUM7QUFFRCxJQUFJO0lBQ0YsR0FBRyxFQUFFLENBQUM7Q0FDUDtBQUFDLE9BQU8sS0FBSyxFQUFFO0lBQ2QsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUNsQixJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQztDQUMvQiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIGNvcmUgZnJvbSAnQGFjdGlvbnMvY29yZSc7XG5pbXBvcnQgeyBleGVjIH0gZnJvbSAnQGFjdGlvbnMvZXhlYyc7XG5pbXBvcnQgeyBFeGVjT3B0aW9ucyB9IGZyb20gJ0BhY3Rpb25zL2V4ZWMvbGliL2ludGVyZmFjZXMnO1xuaW1wb3J0IElucHV0cyBmcm9tICcuL2lucHV0cyc7XG5cbmFzeW5jIGZ1bmN0aW9uIHJ1bigpIHtcbiAgY29yZS5kZWJ1ZygnOjogTG9hZGluZyBpbnB1dCBwYXJhbXMnKTtcbiAgY29uc3QgaW5wdXRzID0gbmV3IElucHV0cygpO1xuXG4gIGNvbnN0IGFjY291bnRVcmwgPSBgJHtpbnB1dHMuQXdzQWNjb3VudElEfS5ka3IuZWNyLiR7aW5wdXRzLlJlZ2lvbn0uYW1hem9uYXdzLmNvbWA7XG5cbiAgLy8gQ29uZmlndXJlIEFXUyBDTElcbiAgYXdzQ29uZmlndXJlKGlucHV0cyk7XG5cbiAgLy8gTG9naW4gdG8gQVdTIEVDUlxuICBhd2FpdCBhd3NFY3JMb2dpbihpbnB1dHMpO1xuXG4gIC8vIENyZWF0ZSBFQ1IgUmVwb1xuICBhd2FpdCBhd3NDcmVhdGVFY3JSZXBvKGlucHV0cyk7XG5cbiAgLy8gQnVpbGQgdGhlIERvY2tlcmZpbGUgaW1hZ2VcbiAgYXdhaXQgYnVpbGRJbWFnZShpbnB1dHMsIGFjY291bnRVcmwpO1xuXG4gIC8vIERlcGxveSBidWlsdCBpbWFnZSB0YWdzIHRvIEFXUyBFQ1JcbiAgYXdhaXQgZGVwbG95VG9FY3IoaW5wdXRzLCBhY2NvdW50VXJsKTtcbn1cblxuZnVuY3Rpb24gYXdzQ29uZmlndXJlKGlucHV0czogSW5wdXRzKSB7XG4gIGNvcmUuZGVidWcoJzo6IFNldHRpbmcgQVdTIGNyZWRlbnRpYWxzJylcbiAgY29yZS5leHBvcnRWYXJpYWJsZSgnQVdTX0FDQ0VTU19LRVlfSUQnLCBpbnB1dHMuQWNjZXNzS2V5SUQpO1xuICBjb3JlLmV4cG9ydFZhcmlhYmxlKCdBV1NfU0VDUkVUX0FDQ0VTU19LRVknLCBpbnB1dHMuU2VjcmV0QWNjZXNzS2V5KTtcbiAgY29yZS5leHBvcnRWYXJpYWJsZSgnQVdTX0RFRkFVTFRfUkVHSU9OJywgaW5wdXRzLlJlZ2lvbik7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGF3c0VjckxvZ2luKGlucHV0czogSW5wdXRzKSB7XG4gIGNvcmUuaW5mbygnPT0gTE9HSU4gSU5UTyBBV1MgRUNSID09JylcblxuICBsZXQgbG9naW5DbWQgPSAnJztcbiAgbGV0IGVyciA9ICcnO1xuXG4gIGxldCBvcHRzOiBFeGVjT3B0aW9ucyA9IHtcbiAgICBjd2Q6ICcuLycsXG4gICAgc2lsZW50OiB0cnVlLFxuICAgIGxpc3RlbmVyczoge1xuICAgICAgc3Rkb3V0OiAoZGF0YTogQnVmZmVyKSA9PiB7XG4gICAgICAgIGxvZ2luQ21kICs9IGRhdGEudG9TdHJpbmcoKTtcbiAgICAgIH0sXG4gICAgICBzdGRlcnI6IChkYXRhOiBCdWZmZXIpID0+IHtcbiAgICAgICAgZXJyICs9IGRhdGEudG9TdHJpbmcoKTtcbiAgICAgIH1cbiAgICB9LFxuICB9XG5cbiAgYXdhaXQgZXhlYyhgYXdzIGVjciBnZXQtbG9naW4gLS1uby1pbmNsdWRlLWVtYWlsIC0tcmVnaW9uICR7aW5wdXRzLlJlZ2lvbn1gLCB1bmRlZmluZWQsIG9wdHMpO1xuICBpZiAoZXJyLmxlbmd0aCA+IDApIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0ZhaWxlZCB0byByZXRyaWV2ZSBkb2NrZXIgbG9naW4gdG8gQVdTIEVDUi4gUGVyaGFwcyB0aGUgQVdTIGNyZWRlbnRpYWxzIGRvIG5vdCBoYXZlIHRoZSBjb3JyZWN0IHBlcm1pc3Npb24nKTtcbiAgfVxuXG4gIGF3YWl0IGV4ZWMobG9naW5DbWQsIHVuZGVmaW5lZCwgb3B0cyk7XG5cbiAgY29yZS5pbmZvKCc9PSBGSU5JU0hFRCBMT0dJTiA9PScpO1xufVxuXG5mdW5jdGlvbiBnZXRFY3JSZXBvTmFtZShpbnB1dHM6IElucHV0cyk6IHN0cmluZyB7XG4gIGlmIChpbnB1dHMuRWNyUmVwb05hbWUubGVuZ3RoID4gMCkge1xuICAgIHJldHVybiBpbnB1dHMuRWNyUmVwb05hbWU7XG4gIH1cblxuICAvLyBkZWZhdWx0XG4gIHJldHVybiAocHJvY2Vzcy5lbnYuR0lUSFVCX1JFUE9TSVRPUlkgfHwgJycpLnRvTG9jYWxlTG93ZXJDYXNlKClcbn1cblxuZnVuY3Rpb24gZ2V0RWNyVGFncyhhY2NvdW50VXJsOiBzdHJpbmcsIHJlcG9OYW1lOiBzdHJpbmcsIGlucHV0VGFnczogc3RyaW5nKTogc3RyaW5nW10ge1xuICBsZXQgdGFncyA9IGlucHV0VGFncy5zcGxpdCgnLCcpO1xuICBjb25zdCBlY3JUYWdzOiBzdHJpbmdbXSA9IFtdO1xuXG4gIC8vIEFkZCB0aGUgcmVmIHRhZyBpZiBjb2RlIGlzIGEgY2hlY2tlZCBvdXQgcmVsZWFzZSB0YWdcbiAgaWYgKChwcm9jZXNzLmVudi5HSVRIVUJfUkVGIHx8ICcnKS5zdGFydHNXaXRoKCdyZWZzL3RhZ3MnKSkge1xuICAgIGNvbnN0IHRhZyA9IChwcm9jZXNzLmVudi5HSVRIVUJfUkVGIHx8ICcnKS5zcGxpdCgnLycpLnBvcCgpO1xuXG4gICAgaWYgKHRhZyAhPT0gJycgfHwgdGFnICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIGVjclRhZ3MucHVzaChgJHthY2NvdW50VXJsfS8ke3JlcG9OYW1lfToke3RhZ31gKTtcbiAgICB9XG4gIH1cblxuICAvLyBCdWlsZCB0aGUgdGFnc1xuICBmb3IgKGNvbnN0IHRhZyBvZiB0YWdzKSB7XG4gICAgZWNyVGFncy5wdXNoKGAke2FjY291bnRVcmx9LyR7cmVwb05hbWV9OiR7dGFnfWApO1xuICB9XG5cbiAgcmV0dXJuIGVjclRhZ3Ncbn1cblxuYXN5bmMgZnVuY3Rpb24gYXdzQ3JlYXRlRWNyUmVwbyhpbnB1dHM6IElucHV0cykge1xuICBjb3JlLmluZm8oJz09IENIRUNLSU5HIEZPUiBFQ1IgUkVQTyA9PScpO1xuXG4gIGNvbnN0IHJlcG9OYW1lID0gZ2V0RWNyUmVwb05hbWUoaW5wdXRzKTtcblxuICB0cnkge1xuICAgIGF3YWl0IGV4ZWMoYGF3cyBlY3IgZGVzY3JpYmUtcmVwb3NpdG9yaWVzIC0tcmVwb3NpdG9yeS1uYW1lcyBcIiR7cmVwb05hbWV9XCJgKTtcbiAgfSBjYXRjaCB7XG4gICAgLy8gUmVwbyBkb2Vzbid0IGV4aXN0IG9yIGZhaWxlZC4gVHJ5IGNyZWF0aW5nIGlmIHNwZWNpZmllZC5cbiAgICBpZiAoaW5wdXRzLlNob3VsZENyZWF0ZVJlcG8gPT09ICd0cnVlJykge1xuICAgICAgY29yZS5pbmZvKCc9PSBDUkVBVElORyBFQ1IgUkVQTyA9PScpO1xuICAgICAgYXdhaXQgZXhlYyhgYXdzIGVjciBjcmVhdGUtcmVwb3NpdG9yeSAtLXJlcG9zaXRvcnktbmFtZSAke3JlcG9OYW1lfWApO1xuICAgICAgY29yZS5pbmZvKGA9PSBGSU5JU0hFRCBDUkVBVElORyBFQ1IgUkVQTyBbICR7cmVwb05hbWV9IF0gPT1gKTtcbiAgICAgIHJldHVyblxuICAgIH0gZWxzZSB7XG4gICAgICBjb3JlLnNldEZhaWxlZCgnPT0gRUNSIFJlcG9zaXRvcnkgaXMgbWlzc2luZyA9PScpO1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBFQ1IgcmVwbyBuYW1lZCBbICR7cmVwb05hbWV9IF0gd2FzIG5vdCBmb3VuZC4gUGVyaGFwcyB0aGUgc3BlbGxpbmcgd2FzIGluY29ycmVjdD9gKTtcbiAgICB9XG4gIH1cblxuICBjb3JlLmluZm8oJz09IFJFUE8gRk9VTkQgPT0nKVxufVxuXG5hc3luYyBmdW5jdGlvbiBidWlsZEltYWdlKGlucHV0czogSW5wdXRzLCBhY2NvdW50VXJsOiBzdHJpbmcpIHtcbiAgY29yZS5pbmZvKCc9PSBCVUlMRCBJTUFHRSBGUk9NIERPQ0tFUkZJTEUgPT0nKTtcbiAgY29uc3QgcmVwb05hbWUgPSBnZXRFY3JSZXBvTmFtZShpbnB1dHMpO1xuICBjb25zdCBlY3JUYWdzID0gZ2V0RWNyVGFncyhhY2NvdW50VXJsLCByZXBvTmFtZSwgaW5wdXRzLkVjclRhZ3MpO1xuXG4gIGxldCB0YWdzID0gZWNyVGFncy5qb2luKCcgLXQgJyk7XG5cbiAgaWYgKHRhZ3MubGVuZ3RoID4gMCkge1xuICAgIHRhZ3MgPSBgLXQgJHt0YWdzfWBcbiAgfVxuXG5cbiAgYXdhaXQgZXhlYyhgZG9ja2VyIGJ1aWxkICR7aW5wdXRzLkRvY2tlckJ1aWxkQXJnc30gLWYgJHtpbnB1dHMuRG9ja2VyZmlsZVBhdGh9ICR7dGFnc30gLmAsIHVuZGVmaW5lZCwge1xuICAgIGN3ZDogaW5wdXRzLlByb2plY3RQYXRoLFxuICB9KTtcbiAgY29yZS5pbmZvKCc9PSBGSU5JU0hFRCBCVUlMRElORyBJTUFHRSA9PScpO1xufVxuXG5hc3luYyBmdW5jdGlvbiBkZXBsb3lUb0VjcihpbnB1dHM6IElucHV0cywgYWNjb3VudFVybDogc3RyaW5nKSB7XG4gIGNvcmUuaW5mbygnPT0gREVQTE9ZSU5HIFRPIEVDUiA9PScpO1xuICBjb3JlLmRlYnVnKGA6OiBFQ1IgQWNjb3VudCBVUkw6ICR7YWNjb3VudFVybH1gKTtcblxuICBjb25zdCByZXBvTmFtZSA9IGdldEVjclJlcG9OYW1lKGlucHV0cyk7XG4gIGNvbnN0IGVjclRhZ3MgPSBnZXRFY3JUYWdzKGFjY291bnRVcmwsIHJlcG9OYW1lLCBpbnB1dHMuRWNyVGFncyk7XG5cbiAgZm9yIChjb25zdCB0YWcgb2YgZWNyVGFncykge1xuICAgIGF3YWl0IGV4ZWMoYGRvY2tlciBwdXNoICR7dGFnfWApO1xuICB9XG5cbiAgY29yZS5pbmZvKCc9PSBGSU5JU0hFRCBERVBMT1lNRU5UID09Jyk7XG59XG5cbnRyeSB7XG4gIHJ1bigpO1xufSBjYXRjaCAoZXJyb3IpIHtcbiAgY29yZS5lcnJvcihlcnJvcik7XG4gIGNvcmUuc2V0RmFpbGVkKGVycm9yLm1lc3NhZ2UpO1xufSJdfQ==

/***/ }),

/***/ 307:
/***/ (function() {

/*! *****************************************************************************
Copyright (C) Microsoft. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */
var Reflect;
(function (Reflect) {
    // Metadata Proposal
    // https://rbuckton.github.io/reflect-metadata/
    (function (factory) {
        var root = typeof global === "object" ? global :
            typeof self === "object" ? self :
                typeof this === "object" ? this :
                    Function("return this;")();
        var exporter = makeExporter(Reflect);
        if (typeof root.Reflect === "undefined") {
            root.Reflect = Reflect;
        }
        else {
            exporter = makeExporter(root.Reflect, exporter);
        }
        factory(exporter);
        function makeExporter(target, previous) {
            return function (key, value) {
                if (typeof target[key] !== "function") {
                    Object.defineProperty(target, key, { configurable: true, writable: true, value: value });
                }
                if (previous)
                    previous(key, value);
            };
        }
    })(function (exporter) {
        var hasOwn = Object.prototype.hasOwnProperty;
        // feature test for Symbol support
        var supportsSymbol = typeof Symbol === "function";
        var toPrimitiveSymbol = supportsSymbol && typeof Symbol.toPrimitive !== "undefined" ? Symbol.toPrimitive : "@@toPrimitive";
        var iteratorSymbol = supportsSymbol && typeof Symbol.iterator !== "undefined" ? Symbol.iterator : "@@iterator";
        var supportsCreate = typeof Object.create === "function"; // feature test for Object.create support
        var supportsProto = { __proto__: [] } instanceof Array; // feature test for __proto__ support
        var downLevel = !supportsCreate && !supportsProto;
        var HashMap = {
            // create an object in dictionary mode (a.k.a. "slow" mode in v8)
            create: supportsCreate
                ? function () { return MakeDictionary(Object.create(null)); }
                : supportsProto
                    ? function () { return MakeDictionary({ __proto__: null }); }
                    : function () { return MakeDictionary({}); },
            has: downLevel
                ? function (map, key) { return hasOwn.call(map, key); }
                : function (map, key) { return key in map; },
            get: downLevel
                ? function (map, key) { return hasOwn.call(map, key) ? map[key] : undefined; }
                : function (map, key) { return map[key]; },
        };
        // Load global or shim versions of Map, Set, and WeakMap
        var functionPrototype = Object.getPrototypeOf(Function);
        var usePolyfill = typeof process === "object" && process.env && process.env["REFLECT_METADATA_USE_MAP_POLYFILL"] === "true";
        var _Map = !usePolyfill && typeof Map === "function" && typeof Map.prototype.entries === "function" ? Map : CreateMapPolyfill();
        var _Set = !usePolyfill && typeof Set === "function" && typeof Set.prototype.entries === "function" ? Set : CreateSetPolyfill();
        var _WeakMap = !usePolyfill && typeof WeakMap === "function" ? WeakMap : CreateWeakMapPolyfill();
        // [[Metadata]] internal slot
        // https://rbuckton.github.io/reflect-metadata/#ordinary-object-internal-methods-and-internal-slots
        var Metadata = new _WeakMap();
        /**
         * Applies a set of decorators to a property of a target object.
         * @param decorators An array of decorators.
         * @param target The target object.
         * @param propertyKey (Optional) The property key to decorate.
         * @param attributes (Optional) The property descriptor for the target key.
         * @remarks Decorators are applied in reverse order.
         * @example
         *
         *     class Example {
         *         // property declarations are not part of ES6, though they are valid in TypeScript:
         *         // static staticProperty;
         *         // property;
         *
         *         constructor(p) { }
         *         static staticMethod(p) { }
         *         method(p) { }
         *     }
         *
         *     // constructor
         *     Example = Reflect.decorate(decoratorsArray, Example);
         *
         *     // property (on constructor)
         *     Reflect.decorate(decoratorsArray, Example, "staticProperty");
         *
         *     // property (on prototype)
         *     Reflect.decorate(decoratorsArray, Example.prototype, "property");
         *
         *     // method (on constructor)
         *     Object.defineProperty(Example, "staticMethod",
         *         Reflect.decorate(decoratorsArray, Example, "staticMethod",
         *             Object.getOwnPropertyDescriptor(Example, "staticMethod")));
         *
         *     // method (on prototype)
         *     Object.defineProperty(Example.prototype, "method",
         *         Reflect.decorate(decoratorsArray, Example.prototype, "method",
         *             Object.getOwnPropertyDescriptor(Example.prototype, "method")));
         *
         */
        function decorate(decorators, target, propertyKey, attributes) {
            if (!IsUndefined(propertyKey)) {
                if (!IsArray(decorators))
                    throw new TypeError();
                if (!IsObject(target))
                    throw new TypeError();
                if (!IsObject(attributes) && !IsUndefined(attributes) && !IsNull(attributes))
                    throw new TypeError();
                if (IsNull(attributes))
                    attributes = undefined;
                propertyKey = ToPropertyKey(propertyKey);
                return DecorateProperty(decorators, target, propertyKey, attributes);
            }
            else {
                if (!IsArray(decorators))
                    throw new TypeError();
                if (!IsConstructor(target))
                    throw new TypeError();
                return DecorateConstructor(decorators, target);
            }
        }
        exporter("decorate", decorate);
        // 4.1.2 Reflect.metadata(metadataKey, metadataValue)
        // https://rbuckton.github.io/reflect-metadata/#reflect.metadata
        /**
         * A default metadata decorator factory that can be used on a class, class member, or parameter.
         * @param metadataKey The key for the metadata entry.
         * @param metadataValue The value for the metadata entry.
         * @returns A decorator function.
         * @remarks
         * If `metadataKey` is already defined for the target and target key, the
         * metadataValue for that key will be overwritten.
         * @example
         *
         *     // constructor
         *     @Reflect.metadata(key, value)
         *     class Example {
         *     }
         *
         *     // property (on constructor, TypeScript only)
         *     class Example {
         *         @Reflect.metadata(key, value)
         *         static staticProperty;
         *     }
         *
         *     // property (on prototype, TypeScript only)
         *     class Example {
         *         @Reflect.metadata(key, value)
         *         property;
         *     }
         *
         *     // method (on constructor)
         *     class Example {
         *         @Reflect.metadata(key, value)
         *         static staticMethod() { }
         *     }
         *
         *     // method (on prototype)
         *     class Example {
         *         @Reflect.metadata(key, value)
         *         method() { }
         *     }
         *
         */
        function metadata(metadataKey, metadataValue) {
            function decorator(target, propertyKey) {
                if (!IsObject(target))
                    throw new TypeError();
                if (!IsUndefined(propertyKey) && !IsPropertyKey(propertyKey))
                    throw new TypeError();
                OrdinaryDefineOwnMetadata(metadataKey, metadataValue, target, propertyKey);
            }
            return decorator;
        }
        exporter("metadata", metadata);
        /**
         * Define a unique metadata entry on the target.
         * @param metadataKey A key used to store and retrieve metadata.
         * @param metadataValue A value that contains attached metadata.
         * @param target The target object on which to define metadata.
         * @param propertyKey (Optional) The property key for the target.
         * @example
         *
         *     class Example {
         *         // property declarations are not part of ES6, though they are valid in TypeScript:
         *         // static staticProperty;
         *         // property;
         *
         *         constructor(p) { }
         *         static staticMethod(p) { }
         *         method(p) { }
         *     }
         *
         *     // constructor
         *     Reflect.defineMetadata("custom:annotation", options, Example);
         *
         *     // property (on constructor)
         *     Reflect.defineMetadata("custom:annotation", options, Example, "staticProperty");
         *
         *     // property (on prototype)
         *     Reflect.defineMetadata("custom:annotation", options, Example.prototype, "property");
         *
         *     // method (on constructor)
         *     Reflect.defineMetadata("custom:annotation", options, Example, "staticMethod");
         *
         *     // method (on prototype)
         *     Reflect.defineMetadata("custom:annotation", options, Example.prototype, "method");
         *
         *     // decorator factory as metadata-producing annotation.
         *     function MyAnnotation(options): Decorator {
         *         return (target, key?) => Reflect.defineMetadata("custom:annotation", options, target, key);
         *     }
         *
         */
        function defineMetadata(metadataKey, metadataValue, target, propertyKey) {
            if (!IsObject(target))
                throw new TypeError();
            if (!IsUndefined(propertyKey))
                propertyKey = ToPropertyKey(propertyKey);
            return OrdinaryDefineOwnMetadata(metadataKey, metadataValue, target, propertyKey);
        }
        exporter("defineMetadata", defineMetadata);
        /**
         * Gets a value indicating whether the target object or its prototype chain has the provided metadata key defined.
         * @param metadataKey A key used to store and retrieve metadata.
         * @param target The target object on which the metadata is defined.
         * @param propertyKey (Optional) The property key for the target.
         * @returns `true` if the metadata key was defined on the target object or its prototype chain; otherwise, `false`.
         * @example
         *
         *     class Example {
         *         // property declarations are not part of ES6, though they are valid in TypeScript:
         *         // static staticProperty;
         *         // property;
         *
         *         constructor(p) { }
         *         static staticMethod(p) { }
         *         method(p) { }
         *     }
         *
         *     // constructor
         *     result = Reflect.hasMetadata("custom:annotation", Example);
         *
         *     // property (on constructor)
         *     result = Reflect.hasMetadata("custom:annotation", Example, "staticProperty");
         *
         *     // property (on prototype)
         *     result = Reflect.hasMetadata("custom:annotation", Example.prototype, "property");
         *
         *     // method (on constructor)
         *     result = Reflect.hasMetadata("custom:annotation", Example, "staticMethod");
         *
         *     // method (on prototype)
         *     result = Reflect.hasMetadata("custom:annotation", Example.prototype, "method");
         *
         */
        function hasMetadata(metadataKey, target, propertyKey) {
            if (!IsObject(target))
                throw new TypeError();
            if (!IsUndefined(propertyKey))
                propertyKey = ToPropertyKey(propertyKey);
            return OrdinaryHasMetadata(metadataKey, target, propertyKey);
        }
        exporter("hasMetadata", hasMetadata);
        /**
         * Gets a value indicating whether the target object has the provided metadata key defined.
         * @param metadataKey A key used to store and retrieve metadata.
         * @param target The target object on which the metadata is defined.
         * @param propertyKey (Optional) The property key for the target.
         * @returns `true` if the metadata key was defined on the target object; otherwise, `false`.
         * @example
         *
         *     class Example {
         *         // property declarations are not part of ES6, though they are valid in TypeScript:
         *         // static staticProperty;
         *         // property;
         *
         *         constructor(p) { }
         *         static staticMethod(p) { }
         *         method(p) { }
         *     }
         *
         *     // constructor
         *     result = Reflect.hasOwnMetadata("custom:annotation", Example);
         *
         *     // property (on constructor)
         *     result = Reflect.hasOwnMetadata("custom:annotation", Example, "staticProperty");
         *
         *     // property (on prototype)
         *     result = Reflect.hasOwnMetadata("custom:annotation", Example.prototype, "property");
         *
         *     // method (on constructor)
         *     result = Reflect.hasOwnMetadata("custom:annotation", Example, "staticMethod");
         *
         *     // method (on prototype)
         *     result = Reflect.hasOwnMetadata("custom:annotation", Example.prototype, "method");
         *
         */
        function hasOwnMetadata(metadataKey, target, propertyKey) {
            if (!IsObject(target))
                throw new TypeError();
            if (!IsUndefined(propertyKey))
                propertyKey = ToPropertyKey(propertyKey);
            return OrdinaryHasOwnMetadata(metadataKey, target, propertyKey);
        }
        exporter("hasOwnMetadata", hasOwnMetadata);
        /**
         * Gets the metadata value for the provided metadata key on the target object or its prototype chain.
         * @param metadataKey A key used to store and retrieve metadata.
         * @param target The target object on which the metadata is defined.
         * @param propertyKey (Optional) The property key for the target.
         * @returns The metadata value for the metadata key if found; otherwise, `undefined`.
         * @example
         *
         *     class Example {
         *         // property declarations are not part of ES6, though they are valid in TypeScript:
         *         // static staticProperty;
         *         // property;
         *
         *         constructor(p) { }
         *         static staticMethod(p) { }
         *         method(p) { }
         *     }
         *
         *     // constructor
         *     result = Reflect.getMetadata("custom:annotation", Example);
         *
         *     // property (on constructor)
         *     result = Reflect.getMetadata("custom:annotation", Example, "staticProperty");
         *
         *     // property (on prototype)
         *     result = Reflect.getMetadata("custom:annotation", Example.prototype, "property");
         *
         *     // method (on constructor)
         *     result = Reflect.getMetadata("custom:annotation", Example, "staticMethod");
         *
         *     // method (on prototype)
         *     result = Reflect.getMetadata("custom:annotation", Example.prototype, "method");
         *
         */
        function getMetadata(metadataKey, target, propertyKey) {
            if (!IsObject(target))
                throw new TypeError();
            if (!IsUndefined(propertyKey))
                propertyKey = ToPropertyKey(propertyKey);
            return OrdinaryGetMetadata(metadataKey, target, propertyKey);
        }
        exporter("getMetadata", getMetadata);
        /**
         * Gets the metadata value for the provided metadata key on the target object.
         * @param metadataKey A key used to store and retrieve metadata.
         * @param target The target object on which the metadata is defined.
         * @param propertyKey (Optional) The property key for the target.
         * @returns The metadata value for the metadata key if found; otherwise, `undefined`.
         * @example
         *
         *     class Example {
         *         // property declarations are not part of ES6, though they are valid in TypeScript:
         *         // static staticProperty;
         *         // property;
         *
         *         constructor(p) { }
         *         static staticMethod(p) { }
         *         method(p) { }
         *     }
         *
         *     // constructor
         *     result = Reflect.getOwnMetadata("custom:annotation", Example);
         *
         *     // property (on constructor)
         *     result = Reflect.getOwnMetadata("custom:annotation", Example, "staticProperty");
         *
         *     // property (on prototype)
         *     result = Reflect.getOwnMetadata("custom:annotation", Example.prototype, "property");
         *
         *     // method (on constructor)
         *     result = Reflect.getOwnMetadata("custom:annotation", Example, "staticMethod");
         *
         *     // method (on prototype)
         *     result = Reflect.getOwnMetadata("custom:annotation", Example.prototype, "method");
         *
         */
        function getOwnMetadata(metadataKey, target, propertyKey) {
            if (!IsObject(target))
                throw new TypeError();
            if (!IsUndefined(propertyKey))
                propertyKey = ToPropertyKey(propertyKey);
            return OrdinaryGetOwnMetadata(metadataKey, target, propertyKey);
        }
        exporter("getOwnMetadata", getOwnMetadata);
        /**
         * Gets the metadata keys defined on the target object or its prototype chain.
         * @param target The target object on which the metadata is defined.
         * @param propertyKey (Optional) The property key for the target.
         * @returns An array of unique metadata keys.
         * @example
         *
         *     class Example {
         *         // property declarations are not part of ES6, though they are valid in TypeScript:
         *         // static staticProperty;
         *         // property;
         *
         *         constructor(p) { }
         *         static staticMethod(p) { }
         *         method(p) { }
         *     }
         *
         *     // constructor
         *     result = Reflect.getMetadataKeys(Example);
         *
         *     // property (on constructor)
         *     result = Reflect.getMetadataKeys(Example, "staticProperty");
         *
         *     // property (on prototype)
         *     result = Reflect.getMetadataKeys(Example.prototype, "property");
         *
         *     // method (on constructor)
         *     result = Reflect.getMetadataKeys(Example, "staticMethod");
         *
         *     // method (on prototype)
         *     result = Reflect.getMetadataKeys(Example.prototype, "method");
         *
         */
        function getMetadataKeys(target, propertyKey) {
            if (!IsObject(target))
                throw new TypeError();
            if (!IsUndefined(propertyKey))
                propertyKey = ToPropertyKey(propertyKey);
            return OrdinaryMetadataKeys(target, propertyKey);
        }
        exporter("getMetadataKeys", getMetadataKeys);
        /**
         * Gets the unique metadata keys defined on the target object.
         * @param target The target object on which the metadata is defined.
         * @param propertyKey (Optional) The property key for the target.
         * @returns An array of unique metadata keys.
         * @example
         *
         *     class Example {
         *         // property declarations are not part of ES6, though they are valid in TypeScript:
         *         // static staticProperty;
         *         // property;
         *
         *         constructor(p) { }
         *         static staticMethod(p) { }
         *         method(p) { }
         *     }
         *
         *     // constructor
         *     result = Reflect.getOwnMetadataKeys(Example);
         *
         *     // property (on constructor)
         *     result = Reflect.getOwnMetadataKeys(Example, "staticProperty");
         *
         *     // property (on prototype)
         *     result = Reflect.getOwnMetadataKeys(Example.prototype, "property");
         *
         *     // method (on constructor)
         *     result = Reflect.getOwnMetadataKeys(Example, "staticMethod");
         *
         *     // method (on prototype)
         *     result = Reflect.getOwnMetadataKeys(Example.prototype, "method");
         *
         */
        function getOwnMetadataKeys(target, propertyKey) {
            if (!IsObject(target))
                throw new TypeError();
            if (!IsUndefined(propertyKey))
                propertyKey = ToPropertyKey(propertyKey);
            return OrdinaryOwnMetadataKeys(target, propertyKey);
        }
        exporter("getOwnMetadataKeys", getOwnMetadataKeys);
        /**
         * Deletes the metadata entry from the target object with the provided key.
         * @param metadataKey A key used to store and retrieve metadata.
         * @param target The target object on which the metadata is defined.
         * @param propertyKey (Optional) The property key for the target.
         * @returns `true` if the metadata entry was found and deleted; otherwise, false.
         * @example
         *
         *     class Example {
         *         // property declarations are not part of ES6, though they are valid in TypeScript:
         *         // static staticProperty;
         *         // property;
         *
         *         constructor(p) { }
         *         static staticMethod(p) { }
         *         method(p) { }
         *     }
         *
         *     // constructor
         *     result = Reflect.deleteMetadata("custom:annotation", Example);
         *
         *     // property (on constructor)
         *     result = Reflect.deleteMetadata("custom:annotation", Example, "staticProperty");
         *
         *     // property (on prototype)
         *     result = Reflect.deleteMetadata("custom:annotation", Example.prototype, "property");
         *
         *     // method (on constructor)
         *     result = Reflect.deleteMetadata("custom:annotation", Example, "staticMethod");
         *
         *     // method (on prototype)
         *     result = Reflect.deleteMetadata("custom:annotation", Example.prototype, "method");
         *
         */
        function deleteMetadata(metadataKey, target, propertyKey) {
            if (!IsObject(target))
                throw new TypeError();
            if (!IsUndefined(propertyKey))
                propertyKey = ToPropertyKey(propertyKey);
            var metadataMap = GetOrCreateMetadataMap(target, propertyKey, /*Create*/ false);
            if (IsUndefined(metadataMap))
                return false;
            if (!metadataMap.delete(metadataKey))
                return false;
            if (metadataMap.size > 0)
                return true;
            var targetMetadata = Metadata.get(target);
            targetMetadata.delete(propertyKey);
            if (targetMetadata.size > 0)
                return true;
            Metadata.delete(target);
            return true;
        }
        exporter("deleteMetadata", deleteMetadata);
        function DecorateConstructor(decorators, target) {
            for (var i = decorators.length - 1; i >= 0; --i) {
                var decorator = decorators[i];
                var decorated = decorator(target);
                if (!IsUndefined(decorated) && !IsNull(decorated)) {
                    if (!IsConstructor(decorated))
                        throw new TypeError();
                    target = decorated;
                }
            }
            return target;
        }
        function DecorateProperty(decorators, target, propertyKey, descriptor) {
            for (var i = decorators.length - 1; i >= 0; --i) {
                var decorator = decorators[i];
                var decorated = decorator(target, propertyKey, descriptor);
                if (!IsUndefined(decorated) && !IsNull(decorated)) {
                    if (!IsObject(decorated))
                        throw new TypeError();
                    descriptor = decorated;
                }
            }
            return descriptor;
        }
        function GetOrCreateMetadataMap(O, P, Create) {
            var targetMetadata = Metadata.get(O);
            if (IsUndefined(targetMetadata)) {
                if (!Create)
                    return undefined;
                targetMetadata = new _Map();
                Metadata.set(O, targetMetadata);
            }
            var metadataMap = targetMetadata.get(P);
            if (IsUndefined(metadataMap)) {
                if (!Create)
                    return undefined;
                metadataMap = new _Map();
                targetMetadata.set(P, metadataMap);
            }
            return metadataMap;
        }
        // 3.1.1.1 OrdinaryHasMetadata(MetadataKey, O, P)
        // https://rbuckton.github.io/reflect-metadata/#ordinaryhasmetadata
        function OrdinaryHasMetadata(MetadataKey, O, P) {
            var hasOwn = OrdinaryHasOwnMetadata(MetadataKey, O, P);
            if (hasOwn)
                return true;
            var parent = OrdinaryGetPrototypeOf(O);
            if (!IsNull(parent))
                return OrdinaryHasMetadata(MetadataKey, parent, P);
            return false;
        }
        // 3.1.2.1 OrdinaryHasOwnMetadata(MetadataKey, O, P)
        // https://rbuckton.github.io/reflect-metadata/#ordinaryhasownmetadata
        function OrdinaryHasOwnMetadata(MetadataKey, O, P) {
            var metadataMap = GetOrCreateMetadataMap(O, P, /*Create*/ false);
            if (IsUndefined(metadataMap))
                return false;
            return ToBoolean(metadataMap.has(MetadataKey));
        }
        // 3.1.3.1 OrdinaryGetMetadata(MetadataKey, O, P)
        // https://rbuckton.github.io/reflect-metadata/#ordinarygetmetadata
        function OrdinaryGetMetadata(MetadataKey, O, P) {
            var hasOwn = OrdinaryHasOwnMetadata(MetadataKey, O, P);
            if (hasOwn)
                return OrdinaryGetOwnMetadata(MetadataKey, O, P);
            var parent = OrdinaryGetPrototypeOf(O);
            if (!IsNull(parent))
                return OrdinaryGetMetadata(MetadataKey, parent, P);
            return undefined;
        }
        // 3.1.4.1 OrdinaryGetOwnMetadata(MetadataKey, O, P)
        // https://rbuckton.github.io/reflect-metadata/#ordinarygetownmetadata
        function OrdinaryGetOwnMetadata(MetadataKey, O, P) {
            var metadataMap = GetOrCreateMetadataMap(O, P, /*Create*/ false);
            if (IsUndefined(metadataMap))
                return undefined;
            return metadataMap.get(MetadataKey);
        }
        // 3.1.5.1 OrdinaryDefineOwnMetadata(MetadataKey, MetadataValue, O, P)
        // https://rbuckton.github.io/reflect-metadata/#ordinarydefineownmetadata
        function OrdinaryDefineOwnMetadata(MetadataKey, MetadataValue, O, P) {
            var metadataMap = GetOrCreateMetadataMap(O, P, /*Create*/ true);
            metadataMap.set(MetadataKey, MetadataValue);
        }
        // 3.1.6.1 OrdinaryMetadataKeys(O, P)
        // https://rbuckton.github.io/reflect-metadata/#ordinarymetadatakeys
        function OrdinaryMetadataKeys(O, P) {
            var ownKeys = OrdinaryOwnMetadataKeys(O, P);
            var parent = OrdinaryGetPrototypeOf(O);
            if (parent === null)
                return ownKeys;
            var parentKeys = OrdinaryMetadataKeys(parent, P);
            if (parentKeys.length <= 0)
                return ownKeys;
            if (ownKeys.length <= 0)
                return parentKeys;
            var set = new _Set();
            var keys = [];
            for (var _i = 0, ownKeys_1 = ownKeys; _i < ownKeys_1.length; _i++) {
                var key = ownKeys_1[_i];
                var hasKey = set.has(key);
                if (!hasKey) {
                    set.add(key);
                    keys.push(key);
                }
            }
            for (var _a = 0, parentKeys_1 = parentKeys; _a < parentKeys_1.length; _a++) {
                var key = parentKeys_1[_a];
                var hasKey = set.has(key);
                if (!hasKey) {
                    set.add(key);
                    keys.push(key);
                }
            }
            return keys;
        }
        // 3.1.7.1 OrdinaryOwnMetadataKeys(O, P)
        // https://rbuckton.github.io/reflect-metadata/#ordinaryownmetadatakeys
        function OrdinaryOwnMetadataKeys(O, P) {
            var keys = [];
            var metadataMap = GetOrCreateMetadataMap(O, P, /*Create*/ false);
            if (IsUndefined(metadataMap))
                return keys;
            var keysObj = metadataMap.keys();
            var iterator = GetIterator(keysObj);
            var k = 0;
            while (true) {
                var next = IteratorStep(iterator);
                if (!next) {
                    keys.length = k;
                    return keys;
                }
                var nextValue = IteratorValue(next);
                try {
                    keys[k] = nextValue;
                }
                catch (e) {
                    try {
                        IteratorClose(iterator);
                    }
                    finally {
                        throw e;
                    }
                }
                k++;
            }
        }
        // 6 ECMAScript Data Typ0es and Values
        // https://tc39.github.io/ecma262/#sec-ecmascript-data-types-and-values
        function Type(x) {
            if (x === null)
                return 1 /* Null */;
            switch (typeof x) {
                case "undefined": return 0 /* Undefined */;
                case "boolean": return 2 /* Boolean */;
                case "string": return 3 /* String */;
                case "symbol": return 4 /* Symbol */;
                case "number": return 5 /* Number */;
                case "object": return x === null ? 1 /* Null */ : 6 /* Object */;
                default: return 6 /* Object */;
            }
        }
        // 6.1.1 The Undefined Type
        // https://tc39.github.io/ecma262/#sec-ecmascript-language-types-undefined-type
        function IsUndefined(x) {
            return x === undefined;
        }
        // 6.1.2 The Null Type
        // https://tc39.github.io/ecma262/#sec-ecmascript-language-types-null-type
        function IsNull(x) {
            return x === null;
        }
        // 6.1.5 The Symbol Type
        // https://tc39.github.io/ecma262/#sec-ecmascript-language-types-symbol-type
        function IsSymbol(x) {
            return typeof x === "symbol";
        }
        // 6.1.7 The Object Type
        // https://tc39.github.io/ecma262/#sec-object-type
        function IsObject(x) {
            return typeof x === "object" ? x !== null : typeof x === "function";
        }
        // 7.1 Type Conversion
        // https://tc39.github.io/ecma262/#sec-type-conversion
        // 7.1.1 ToPrimitive(input [, PreferredType])
        // https://tc39.github.io/ecma262/#sec-toprimitive
        function ToPrimitive(input, PreferredType) {
            switch (Type(input)) {
                case 0 /* Undefined */: return input;
                case 1 /* Null */: return input;
                case 2 /* Boolean */: return input;
                case 3 /* String */: return input;
                case 4 /* Symbol */: return input;
                case 5 /* Number */: return input;
            }
            var hint = PreferredType === 3 /* String */ ? "string" : PreferredType === 5 /* Number */ ? "number" : "default";
            var exoticToPrim = GetMethod(input, toPrimitiveSymbol);
            if (exoticToPrim !== undefined) {
                var result = exoticToPrim.call(input, hint);
                if (IsObject(result))
                    throw new TypeError();
                return result;
            }
            return OrdinaryToPrimitive(input, hint === "default" ? "number" : hint);
        }
        // 7.1.1.1 OrdinaryToPrimitive(O, hint)
        // https://tc39.github.io/ecma262/#sec-ordinarytoprimitive
        function OrdinaryToPrimitive(O, hint) {
            if (hint === "string") {
                var toString_1 = O.toString;
                if (IsCallable(toString_1)) {
                    var result = toString_1.call(O);
                    if (!IsObject(result))
                        return result;
                }
                var valueOf = O.valueOf;
                if (IsCallable(valueOf)) {
                    var result = valueOf.call(O);
                    if (!IsObject(result))
                        return result;
                }
            }
            else {
                var valueOf = O.valueOf;
                if (IsCallable(valueOf)) {
                    var result = valueOf.call(O);
                    if (!IsObject(result))
                        return result;
                }
                var toString_2 = O.toString;
                if (IsCallable(toString_2)) {
                    var result = toString_2.call(O);
                    if (!IsObject(result))
                        return result;
                }
            }
            throw new TypeError();
        }
        // 7.1.2 ToBoolean(argument)
        // https://tc39.github.io/ecma262/2016/#sec-toboolean
        function ToBoolean(argument) {
            return !!argument;
        }
        // 7.1.12 ToString(argument)
        // https://tc39.github.io/ecma262/#sec-tostring
        function ToString(argument) {
            return "" + argument;
        }
        // 7.1.14 ToPropertyKey(argument)
        // https://tc39.github.io/ecma262/#sec-topropertykey
        function ToPropertyKey(argument) {
            var key = ToPrimitive(argument, 3 /* String */);
            if (IsSymbol(key))
                return key;
            return ToString(key);
        }
        // 7.2 Testing and Comparison Operations
        // https://tc39.github.io/ecma262/#sec-testing-and-comparison-operations
        // 7.2.2 IsArray(argument)
        // https://tc39.github.io/ecma262/#sec-isarray
        function IsArray(argument) {
            return Array.isArray
                ? Array.isArray(argument)
                : argument instanceof Object
                    ? argument instanceof Array
                    : Object.prototype.toString.call(argument) === "[object Array]";
        }
        // 7.2.3 IsCallable(argument)
        // https://tc39.github.io/ecma262/#sec-iscallable
        function IsCallable(argument) {
            // NOTE: This is an approximation as we cannot check for [[Call]] internal method.
            return typeof argument === "function";
        }
        // 7.2.4 IsConstructor(argument)
        // https://tc39.github.io/ecma262/#sec-isconstructor
        function IsConstructor(argument) {
            // NOTE: This is an approximation as we cannot check for [[Construct]] internal method.
            return typeof argument === "function";
        }
        // 7.2.7 IsPropertyKey(argument)
        // https://tc39.github.io/ecma262/#sec-ispropertykey
        function IsPropertyKey(argument) {
            switch (Type(argument)) {
                case 3 /* String */: return true;
                case 4 /* Symbol */: return true;
                default: return false;
            }
        }
        // 7.3 Operations on Objects
        // https://tc39.github.io/ecma262/#sec-operations-on-objects
        // 7.3.9 GetMethod(V, P)
        // https://tc39.github.io/ecma262/#sec-getmethod
        function GetMethod(V, P) {
            var func = V[P];
            if (func === undefined || func === null)
                return undefined;
            if (!IsCallable(func))
                throw new TypeError();
            return func;
        }
        // 7.4 Operations on Iterator Objects
        // https://tc39.github.io/ecma262/#sec-operations-on-iterator-objects
        function GetIterator(obj) {
            var method = GetMethod(obj, iteratorSymbol);
            if (!IsCallable(method))
                throw new TypeError(); // from Call
            var iterator = method.call(obj);
            if (!IsObject(iterator))
                throw new TypeError();
            return iterator;
        }
        // 7.4.4 IteratorValue(iterResult)
        // https://tc39.github.io/ecma262/2016/#sec-iteratorvalue
        function IteratorValue(iterResult) {
            return iterResult.value;
        }
        // 7.4.5 IteratorStep(iterator)
        // https://tc39.github.io/ecma262/#sec-iteratorstep
        function IteratorStep(iterator) {
            var result = iterator.next();
            return result.done ? false : result;
        }
        // 7.4.6 IteratorClose(iterator, completion)
        // https://tc39.github.io/ecma262/#sec-iteratorclose
        function IteratorClose(iterator) {
            var f = iterator["return"];
            if (f)
                f.call(iterator);
        }
        // 9.1 Ordinary Object Internal Methods and Internal Slots
        // https://tc39.github.io/ecma262/#sec-ordinary-object-internal-methods-and-internal-slots
        // 9.1.1.1 OrdinaryGetPrototypeOf(O)
        // https://tc39.github.io/ecma262/#sec-ordinarygetprototypeof
        function OrdinaryGetPrototypeOf(O) {
            var proto = Object.getPrototypeOf(O);
            if (typeof O !== "function" || O === functionPrototype)
                return proto;
            // TypeScript doesn't set __proto__ in ES5, as it's non-standard.
            // Try to determine the superclass constructor. Compatible implementations
            // must either set __proto__ on a subclass constructor to the superclass constructor,
            // or ensure each class has a valid `constructor` property on its prototype that
            // points back to the constructor.
            // If this is not the same as Function.[[Prototype]], then this is definately inherited.
            // This is the case when in ES6 or when using __proto__ in a compatible browser.
            if (proto !== functionPrototype)
                return proto;
            // If the super prototype is Object.prototype, null, or undefined, then we cannot determine the heritage.
            var prototype = O.prototype;
            var prototypeProto = prototype && Object.getPrototypeOf(prototype);
            if (prototypeProto == null || prototypeProto === Object.prototype)
                return proto;
            // If the constructor was not a function, then we cannot determine the heritage.
            var constructor = prototypeProto.constructor;
            if (typeof constructor !== "function")
                return proto;
            // If we have some kind of self-reference, then we cannot determine the heritage.
            if (constructor === O)
                return proto;
            // we have a pretty good guess at the heritage.
            return constructor;
        }
        // naive Map shim
        function CreateMapPolyfill() {
            var cacheSentinel = {};
            var arraySentinel = [];
            var MapIterator = /** @class */ (function () {
                function MapIterator(keys, values, selector) {
                    this._index = 0;
                    this._keys = keys;
                    this._values = values;
                    this._selector = selector;
                }
                MapIterator.prototype["@@iterator"] = function () { return this; };
                MapIterator.prototype[iteratorSymbol] = function () { return this; };
                MapIterator.prototype.next = function () {
                    var index = this._index;
                    if (index >= 0 && index < this._keys.length) {
                        var result = this._selector(this._keys[index], this._values[index]);
                        if (index + 1 >= this._keys.length) {
                            this._index = -1;
                            this._keys = arraySentinel;
                            this._values = arraySentinel;
                        }
                        else {
                            this._index++;
                        }
                        return { value: result, done: false };
                    }
                    return { value: undefined, done: true };
                };
                MapIterator.prototype.throw = function (error) {
                    if (this._index >= 0) {
                        this._index = -1;
                        this._keys = arraySentinel;
                        this._values = arraySentinel;
                    }
                    throw error;
                };
                MapIterator.prototype.return = function (value) {
                    if (this._index >= 0) {
                        this._index = -1;
                        this._keys = arraySentinel;
                        this._values = arraySentinel;
                    }
                    return { value: value, done: true };
                };
                return MapIterator;
            }());
            return /** @class */ (function () {
                function Map() {
                    this._keys = [];
                    this._values = [];
                    this._cacheKey = cacheSentinel;
                    this._cacheIndex = -2;
                }
                Object.defineProperty(Map.prototype, "size", {
                    get: function () { return this._keys.length; },
                    enumerable: true,
                    configurable: true
                });
                Map.prototype.has = function (key) { return this._find(key, /*insert*/ false) >= 0; };
                Map.prototype.get = function (key) {
                    var index = this._find(key, /*insert*/ false);
                    return index >= 0 ? this._values[index] : undefined;
                };
                Map.prototype.set = function (key, value) {
                    var index = this._find(key, /*insert*/ true);
                    this._values[index] = value;
                    return this;
                };
                Map.prototype.delete = function (key) {
                    var index = this._find(key, /*insert*/ false);
                    if (index >= 0) {
                        var size = this._keys.length;
                        for (var i = index + 1; i < size; i++) {
                            this._keys[i - 1] = this._keys[i];
                            this._values[i - 1] = this._values[i];
                        }
                        this._keys.length--;
                        this._values.length--;
                        if (key === this._cacheKey) {
                            this._cacheKey = cacheSentinel;
                            this._cacheIndex = -2;
                        }
                        return true;
                    }
                    return false;
                };
                Map.prototype.clear = function () {
                    this._keys.length = 0;
                    this._values.length = 0;
                    this._cacheKey = cacheSentinel;
                    this._cacheIndex = -2;
                };
                Map.prototype.keys = function () { return new MapIterator(this._keys, this._values, getKey); };
                Map.prototype.values = function () { return new MapIterator(this._keys, this._values, getValue); };
                Map.prototype.entries = function () { return new MapIterator(this._keys, this._values, getEntry); };
                Map.prototype["@@iterator"] = function () { return this.entries(); };
                Map.prototype[iteratorSymbol] = function () { return this.entries(); };
                Map.prototype._find = function (key, insert) {
                    if (this._cacheKey !== key) {
                        this._cacheIndex = this._keys.indexOf(this._cacheKey = key);
                    }
                    if (this._cacheIndex < 0 && insert) {
                        this._cacheIndex = this._keys.length;
                        this._keys.push(key);
                        this._values.push(undefined);
                    }
                    return this._cacheIndex;
                };
                return Map;
            }());
            function getKey(key, _) {
                return key;
            }
            function getValue(_, value) {
                return value;
            }
            function getEntry(key, value) {
                return [key, value];
            }
        }
        // naive Set shim
        function CreateSetPolyfill() {
            return /** @class */ (function () {
                function Set() {
                    this._map = new _Map();
                }
                Object.defineProperty(Set.prototype, "size", {
                    get: function () { return this._map.size; },
                    enumerable: true,
                    configurable: true
                });
                Set.prototype.has = function (value) { return this._map.has(value); };
                Set.prototype.add = function (value) { return this._map.set(value, value), this; };
                Set.prototype.delete = function (value) { return this._map.delete(value); };
                Set.prototype.clear = function () { this._map.clear(); };
                Set.prototype.keys = function () { return this._map.keys(); };
                Set.prototype.values = function () { return this._map.values(); };
                Set.prototype.entries = function () { return this._map.entries(); };
                Set.prototype["@@iterator"] = function () { return this.keys(); };
                Set.prototype[iteratorSymbol] = function () { return this.keys(); };
                return Set;
            }());
        }
        // naive WeakMap shim
        function CreateWeakMapPolyfill() {
            var UUID_SIZE = 16;
            var keys = HashMap.create();
            var rootKey = CreateUniqueKey();
            return /** @class */ (function () {
                function WeakMap() {
                    this._key = CreateUniqueKey();
                }
                WeakMap.prototype.has = function (target) {
                    var table = GetOrCreateWeakMapTable(target, /*create*/ false);
                    return table !== undefined ? HashMap.has(table, this._key) : false;
                };
                WeakMap.prototype.get = function (target) {
                    var table = GetOrCreateWeakMapTable(target, /*create*/ false);
                    return table !== undefined ? HashMap.get(table, this._key) : undefined;
                };
                WeakMap.prototype.set = function (target, value) {
                    var table = GetOrCreateWeakMapTable(target, /*create*/ true);
                    table[this._key] = value;
                    return this;
                };
                WeakMap.prototype.delete = function (target) {
                    var table = GetOrCreateWeakMapTable(target, /*create*/ false);
                    return table !== undefined ? delete table[this._key] : false;
                };
                WeakMap.prototype.clear = function () {
                    // NOTE: not a real clear, just makes the previous data unreachable
                    this._key = CreateUniqueKey();
                };
                return WeakMap;
            }());
            function CreateUniqueKey() {
                var key;
                do
                    key = "@@WeakMap@@" + CreateUUID();
                while (HashMap.has(keys, key));
                keys[key] = true;
                return key;
            }
            function GetOrCreateWeakMapTable(target, create) {
                if (!hasOwn.call(target, rootKey)) {
                    if (!create)
                        return undefined;
                    Object.defineProperty(target, rootKey, { value: HashMap.create() });
                }
                return target[rootKey];
            }
            function FillRandomBytes(buffer, size) {
                for (var i = 0; i < size; ++i)
                    buffer[i] = Math.random() * 0xff | 0;
                return buffer;
            }
            function GenRandomBytes(size) {
                if (typeof Uint8Array === "function") {
                    if (typeof crypto !== "undefined")
                        return crypto.getRandomValues(new Uint8Array(size));
                    if (typeof msCrypto !== "undefined")
                        return msCrypto.getRandomValues(new Uint8Array(size));
                    return FillRandomBytes(new Uint8Array(size), size);
                }
                return FillRandomBytes(new Array(size), size);
            }
            function CreateUUID() {
                var data = GenRandomBytes(UUID_SIZE);
                // mark as random - RFC 4122 § 4.4
                data[6] = data[6] & 0x4f | 0x40;
                data[8] = data[8] & 0xbf | 0x80;
                var result = "";
                for (var offset = 0; offset < UUID_SIZE; ++offset) {
                    var byte = data[offset];
                    if (offset === 4 || offset === 6 || offset === 8)
                        result += "-";
                    if (byte < 16)
                        result += "0";
                    result += byte.toString(16).toLowerCase();
                }
                return result;
            }
        }
        // uses a heuristic used by v8 and chakra to force an object into dictionary mode.
        function MakeDictionary(obj) {
            obj.__ = undefined;
            delete obj.__;
            return obj;
        }
    });
})(Reflect || (Reflect = {}));


/***/ }),

/***/ 431:
/***/ (function(__unusedmodule, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const os = __webpack_require__(87);
/**
 * Commands
 *
 * Command Format:
 *   ##[name key=value;key=value]message
 *
 * Examples:
 *   ##[warning]This is the user warning message
 *   ##[set-secret name=mypassword]definitelyNotAPassword!
 */
function issueCommand(command, properties, message) {
    const cmd = new Command(command, properties, message);
    process.stdout.write(cmd.toString() + os.EOL);
}
exports.issueCommand = issueCommand;
function issue(name, message = '') {
    issueCommand(name, {}, message);
}
exports.issue = issue;
const CMD_STRING = '::';
class Command {
    constructor(command, properties, message) {
        if (!command) {
            command = 'missing.command';
        }
        this.command = command;
        this.properties = properties;
        this.message = message;
    }
    toString() {
        let cmdStr = CMD_STRING + this.command;
        if (this.properties && Object.keys(this.properties).length > 0) {
            cmdStr += ' ';
            for (const key in this.properties) {
                if (this.properties.hasOwnProperty(key)) {
                    const val = this.properties[key];
                    if (val) {
                        // safely append the val - avoid blowing up when attempting to
                        // call .replace() if message is not a string for some reason
                        cmdStr += `${key}=${escape(`${val || ''}`)},`;
                    }
                }
            }
        }
        cmdStr += CMD_STRING;
        // safely append the message - avoid blowing up when attempting to
        // call .replace() if message is not a string for some reason
        const message = `${this.message || ''}`;
        cmdStr += escapeData(message);
        return cmdStr;
    }
}
function escapeData(s) {
    return s.replace(/\r/g, '%0D').replace(/\n/g, '%0A');
}
function escape(s) {
    return s
        .replace(/\r/g, '%0D')
        .replace(/\n/g, '%0A')
        .replace(/]/g, '%5D')
        .replace(/;/g, '%3B');
}
//# sourceMappingURL=command.js.map

/***/ }),

/***/ 470:
/***/ (function(__unusedmodule, exports, __webpack_require__) {

"use strict";

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const command_1 = __webpack_require__(431);
const os = __webpack_require__(87);
const path = __webpack_require__(622);
/**
 * The code to exit an action
 */
var ExitCode;
(function (ExitCode) {
    /**
     * A code indicating that the action was successful
     */
    ExitCode[ExitCode["Success"] = 0] = "Success";
    /**
     * A code indicating that the action was a failure
     */
    ExitCode[ExitCode["Failure"] = 1] = "Failure";
})(ExitCode = exports.ExitCode || (exports.ExitCode = {}));
//-----------------------------------------------------------------------
// Variables
//-----------------------------------------------------------------------
/**
 * Sets env variable for this action and future actions in the job
 * @param name the name of the variable to set
 * @param val the value of the variable
 */
function exportVariable(name, val) {
    process.env[name] = val;
    command_1.issueCommand('set-env', { name }, val);
}
exports.exportVariable = exportVariable;
/**
 * Registers a secret which will get masked from logs
 * @param secret value of the secret
 */
function setSecret(secret) {
    command_1.issueCommand('add-mask', {}, secret);
}
exports.setSecret = setSecret;
/**
 * Prepends inputPath to the PATH (for this action and future actions)
 * @param inputPath
 */
function addPath(inputPath) {
    command_1.issueCommand('add-path', {}, inputPath);
    process.env['PATH'] = `${inputPath}${path.delimiter}${process.env['PATH']}`;
}
exports.addPath = addPath;
/**
 * Gets the value of an input.  The value is also trimmed.
 *
 * @param     name     name of the input to get
 * @param     options  optional. See InputOptions.
 * @returns   string
 */
function getInput(name, options) {
    const val = process.env[`INPUT_${name.replace(/ /g, '_').toUpperCase()}`] || '';
    if (options && options.required && !val) {
        throw new Error(`Input required and not supplied: ${name}`);
    }
    return val.trim();
}
exports.getInput = getInput;
/**
 * Sets the value of an output.
 *
 * @param     name     name of the output to set
 * @param     value    value to store
 */
function setOutput(name, value) {
    command_1.issueCommand('set-output', { name }, value);
}
exports.setOutput = setOutput;
//-----------------------------------------------------------------------
// Results
//-----------------------------------------------------------------------
/**
 * Sets the action status to failed.
 * When the action exits it will be with an exit code of 1
 * @param message add error issue message
 */
function setFailed(message) {
    process.exitCode = ExitCode.Failure;
    error(message);
}
exports.setFailed = setFailed;
//-----------------------------------------------------------------------
// Logging Commands
//-----------------------------------------------------------------------
/**
 * Writes debug message to user log
 * @param message debug message
 */
function debug(message) {
    command_1.issueCommand('debug', {}, message);
}
exports.debug = debug;
/**
 * Adds an error issue
 * @param message error issue message
 */
function error(message) {
    command_1.issue('error', message);
}
exports.error = error;
/**
 * Adds an warning issue
 * @param message warning issue message
 */
function warning(message) {
    command_1.issue('warning', message);
}
exports.warning = warning;
/**
 * Writes info to log with console.log.
 * @param message info message
 */
function info(message) {
    process.stdout.write(message + os.EOL);
}
exports.info = info;
/**
 * Begin an output group.
 *
 * Output until the next `groupEnd` will be foldable in this group
 *
 * @param name The name of the output group
 */
function startGroup(name) {
    command_1.issue('group', name);
}
exports.startGroup = startGroup;
/**
 * End an output group.
 */
function endGroup() {
    command_1.issue('endgroup');
}
exports.endGroup = endGroup;
/**
 * Wrap an asynchronous function call in a group.
 *
 * Returns the same type as the function itself.
 *
 * @param name The name of the group
 * @param fn The function to wrap in the group
 */
function group(name, fn) {
    return __awaiter(this, void 0, void 0, function* () {
        startGroup(name);
        let result;
        try {
            result = yield fn();
        }
        finally {
            endGroup();
        }
        return result;
    });
}
exports.group = group;
//-----------------------------------------------------------------------
// Wrapper action state
//-----------------------------------------------------------------------
/**
 * Saves state for current action, the state can only be retrieved by this action's post job execution.
 *
 * @param     name     name of the state to store
 * @param     value    value to store
 */
function saveState(name, value) {
    command_1.issueCommand('save-state', { name }, value);
}
exports.saveState = saveState;
/**
 * Gets the value of an state set by this action's main execution.
 *
 * @param     name     name of the state to get
 * @returns   string
 */
function getState(name) {
    return process.env[`STATE_${name}`] || '';
}
exports.getState = getState;
//# sourceMappingURL=core.js.map

/***/ }),

/***/ 614:
/***/ (function(module) {

module.exports = require("events");

/***/ }),

/***/ 622:
/***/ (function(module) {

module.exports = require("path");

/***/ }),

/***/ 842:
/***/ (function(__unusedmodule, exports, __webpack_require__) {

"use strict";

var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
const core = __webpack_require__(470);
__webpack_require__(307);
const decorators_1 = __webpack_require__(909);
class Inputs {
    constructor() {
        // REQUIRED ARGUMENTS
        this.AwsAccountID = '';
        this.AccessKeyID = '';
        this.SecretAccessKey = '';
        this.Region = '';
        // OPTIONAL ARGUMENTS
        this.ShouldCreateRepo = 'false';
        this.DockerfilePath = '';
        this.DockerBuildArgs = '';
        this.ProjectPath = '.';
        this.EcrRepoName = '';
        this.EcrTags = '';
        this.loadRequired();
        this.loadOptional();
    }
    loadRequired() {
        const missingInputs = [];
        for (const prop of Object.keys(this)) {
            if (decorators_1.isRequired(this, prop)) {
                const inputName = decorators_1.getInputName(this, prop);
                const value = core.getInput(inputName);
                if (value.length === 0) {
                    missingInputs.push(inputName);
                }
                if (!Reflect.set(this, prop, value)) {
                    throw new Error(`Failed to set the value of [ ${inputName} ] during action setup`);
                }
            }
        }
        if (missingInputs.length > 0) {
            throw new Error(`Missing required inputs [ ${missingInputs.join(', ')} ]. Did you set using the 'with' property?`);
        }
    }
    loadOptional() {
        for (const prop of Object.keys(this)) {
            if (decorators_1.isOptional(this, prop)) {
                const inputName = decorators_1.getInputName(this, prop);
                const value = core.getInput(inputName);
                Reflect.set(this, prop, value);
            }
        }
    }
}
__decorate([
    decorators_1.Input('account_id'),
    decorators_1.Required,
    __metadata("design:type", String)
], Inputs.prototype, "AwsAccountID", void 0);
__decorate([
    decorators_1.Input('access_key_id'),
    decorators_1.Required,
    __metadata("design:type", String)
], Inputs.prototype, "AccessKeyID", void 0);
__decorate([
    decorators_1.Input('secret_access_key'),
    decorators_1.Required,
    __metadata("design:type", String)
], Inputs.prototype, "SecretAccessKey", void 0);
__decorate([
    decorators_1.Input('region'),
    decorators_1.Required,
    __metadata("design:type", String)
], Inputs.prototype, "Region", void 0);
__decorate([
    decorators_1.Input('create_repo'),
    decorators_1.Optional,
    __metadata("design:type", String)
], Inputs.prototype, "ShouldCreateRepo", void 0);
__decorate([
    decorators_1.Input('dockerfile'),
    decorators_1.Optional,
    __metadata("design:type", String)
], Inputs.prototype, "DockerfilePath", void 0);
__decorate([
    decorators_1.Input('docker_build_args'),
    decorators_1.Optional,
    __metadata("design:type", String)
], Inputs.prototype, "DockerBuildArgs", void 0);
__decorate([
    decorators_1.Input('path'),
    decorators_1.Optional,
    __metadata("design:type", String)
], Inputs.prototype, "ProjectPath", void 0);
__decorate([
    decorators_1.Input('repo'),
    decorators_1.Optional,
    __metadata("design:type", String)
], Inputs.prototype, "EcrRepoName", void 0);
__decorate([
    decorators_1.Input('tags') // comma-delimited string
    ,
    decorators_1.Optional,
    __metadata("design:type", String)
], Inputs.prototype, "EcrTags", void 0);
exports.default = Inputs;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5wdXRzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2lucHV0cy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQUFBLHNDQUFzQztBQUN0Qyw0QkFBMEI7QUFDMUIsNkNBQStGO0FBRS9GLE1BQXFCLE1BQU07SUE2Q3pCO1FBNUNBLHFCQUFxQjtRQUlMLGlCQUFZLEdBQVcsRUFBRSxDQUFDO1FBSTFCLGdCQUFXLEdBQVcsRUFBRSxDQUFDO1FBSXpCLG9CQUFlLEdBQVcsRUFBRSxDQUFDO1FBSTdCLFdBQU0sR0FBVyxFQUFFLENBQUM7UUFFcEMscUJBQXFCO1FBSUwscUJBQWdCLEdBQVcsT0FBTyxDQUFDO1FBSW5DLG1CQUFjLEdBQVcsRUFBRSxDQUFDO1FBSTVCLG9CQUFlLEdBQVcsRUFBRSxDQUFDO1FBSTdCLGdCQUFXLEdBQVcsR0FBRyxDQUFDO1FBSTFCLGdCQUFXLEdBQVcsRUFBRSxDQUFDO1FBSXpCLFlBQU8sR0FBVyxFQUFFLENBQUM7UUFHbkMsSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDO1FBQ3BCLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQztJQUN0QixDQUFDO0lBRUQsWUFBWTtRQUNWLE1BQU0sYUFBYSxHQUFhLEVBQUUsQ0FBQztRQUVuQyxLQUFJLE1BQU0sSUFBSSxJQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUU7WUFDbkMsSUFBSSx1QkFBVSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsRUFBRTtnQkFDMUIsTUFBTSxTQUFTLEdBQUcseUJBQVksQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7Z0JBQzNDLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLENBQUM7Z0JBRXZDLElBQUksS0FBSyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7b0JBQ3RCLGFBQWEsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7aUJBQy9CO2dCQUVELElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsS0FBSyxDQUFDLEVBQUU7b0JBQ25DLE1BQU0sSUFBSSxLQUFLLENBQUMsZ0NBQWdDLFNBQVMsd0JBQXdCLENBQUMsQ0FBQztpQkFDcEY7YUFDRjtTQUNGO1FBRUQsSUFBSSxhQUFhLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtZQUM1QixNQUFNLElBQUksS0FBSyxDQUFDLDZCQUE2QixhQUFhLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyw0Q0FBNEMsQ0FBQyxDQUFDO1NBQ3BIO0lBQ0gsQ0FBQztJQUVELFlBQVk7UUFDVixLQUFJLE1BQU0sSUFBSSxJQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUU7WUFDbkMsSUFBSSx1QkFBVSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsRUFBRTtnQkFDMUIsTUFBTSxTQUFTLEdBQUcseUJBQVksQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7Z0JBQzNDLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLENBQUM7Z0JBQ3ZDLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQzthQUNoQztTQUNGO0lBQ0gsQ0FBQztDQUNGO0FBN0VDO0lBRkMsa0JBQUssQ0FBQyxZQUFZLENBQUM7SUFDbkIscUJBQVE7OzRDQUNpQztBQUkxQztJQUZDLGtCQUFLLENBQUMsZUFBZSxDQUFDO0lBQ3RCLHFCQUFROzsyQ0FDZ0M7QUFJekM7SUFGQyxrQkFBSyxDQUFDLG1CQUFtQixDQUFDO0lBQzFCLHFCQUFROzsrQ0FDb0M7QUFJN0M7SUFGQyxrQkFBSyxDQUFDLFFBQVEsQ0FBQztJQUNmLHFCQUFROztzQ0FDMkI7QUFNcEM7SUFGQyxrQkFBSyxDQUFDLGFBQWEsQ0FBQztJQUNwQixxQkFBUTs7Z0RBQzBDO0FBSW5EO0lBRkMsa0JBQUssQ0FBQyxZQUFZLENBQUM7SUFDbkIscUJBQVE7OzhDQUNtQztBQUk1QztJQUZDLGtCQUFLLENBQUMsbUJBQW1CLENBQUM7SUFDMUIscUJBQVE7OytDQUNvQztBQUk3QztJQUZDLGtCQUFLLENBQUMsTUFBTSxDQUFDO0lBQ2IscUJBQVE7OzJDQUNpQztBQUkxQztJQUZDLGtCQUFLLENBQUMsTUFBTSxDQUFDO0lBQ2IscUJBQVE7OzJDQUNnQztBQUl6QztJQUZDLGtCQUFLLENBQUMsTUFBTSxDQUFDLENBQUMseUJBQXlCOztJQUN2QyxxQkFBUTs7dUNBQzRCO0FBM0N2Qyx5QkFrRkMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBjb3JlIGZyb20gJ0BhY3Rpb25zL2NvcmUnO1xuaW1wb3J0ICdyZWZsZWN0LW1ldGFkYXRhJztcbmltcG9ydCB7IGdldElucHV0TmFtZSwgSW5wdXQsIGlzT3B0aW9uYWwsIGlzUmVxdWlyZWQsIE9wdGlvbmFsLCBSZXF1aXJlZCB9IGZyb20gJy4vZGVjb3JhdG9ycyc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIElucHV0cyB7XG4gIC8vIFJFUVVJUkVEIEFSR1VNRU5UU1xuXG4gIEBJbnB1dCgnYWNjb3VudF9pZCcpXG4gIEBSZXF1aXJlZFxuICBwdWJsaWMgcmVhZG9ubHkgQXdzQWNjb3VudElEOiBzdHJpbmcgPSAnJztcblxuICBASW5wdXQoJ2FjY2Vzc19rZXlfaWQnKVxuICBAUmVxdWlyZWRcbiAgcHVibGljIHJlYWRvbmx5IEFjY2Vzc0tleUlEOiBzdHJpbmcgPSAnJztcblxuICBASW5wdXQoJ3NlY3JldF9hY2Nlc3Nfa2V5JylcbiAgQFJlcXVpcmVkXG4gIHB1YmxpYyByZWFkb25seSBTZWNyZXRBY2Nlc3NLZXk6IHN0cmluZyA9ICcnO1xuXG4gIEBJbnB1dCgncmVnaW9uJylcbiAgQFJlcXVpcmVkXG4gIHB1YmxpYyByZWFkb25seSBSZWdpb246IHN0cmluZyA9ICcnO1xuXG4gIC8vIE9QVElPTkFMIEFSR1VNRU5UU1xuXG4gIEBJbnB1dCgnY3JlYXRlX3JlcG8nKVxuICBAT3B0aW9uYWxcbiAgcHVibGljIHJlYWRvbmx5IFNob3VsZENyZWF0ZVJlcG86IHN0cmluZyA9ICdmYWxzZSc7XG5cbiAgQElucHV0KCdkb2NrZXJmaWxlJylcbiAgQE9wdGlvbmFsXG4gIHB1YmxpYyByZWFkb25seSBEb2NrZXJmaWxlUGF0aDogc3RyaW5nID0gJyc7XG5cbiAgQElucHV0KCdkb2NrZXJfYnVpbGRfYXJncycpXG4gIEBPcHRpb25hbFxuICBwdWJsaWMgcmVhZG9ubHkgRG9ja2VyQnVpbGRBcmdzOiBzdHJpbmcgPSAnJztcblxuICBASW5wdXQoJ3BhdGgnKVxuICBAT3B0aW9uYWxcbiAgcHVibGljIHJlYWRvbmx5IFByb2plY3RQYXRoOiBzdHJpbmcgPSAnLic7XG5cbiAgQElucHV0KCdyZXBvJylcbiAgQE9wdGlvbmFsXG4gIHB1YmxpYyByZWFkb25seSBFY3JSZXBvTmFtZTogc3RyaW5nID0gJyc7XG5cbiAgQElucHV0KCd0YWdzJykgLy8gY29tbWEtZGVsaW1pdGVkIHN0cmluZ1xuICBAT3B0aW9uYWxcbiAgcHVibGljIHJlYWRvbmx5IEVjclRhZ3M6IHN0cmluZyA9ICcnO1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMubG9hZFJlcXVpcmVkKCk7XG4gICAgdGhpcy5sb2FkT3B0aW9uYWwoKTtcbiAgfVxuXG4gIGxvYWRSZXF1aXJlZCgpIHtcbiAgICBjb25zdCBtaXNzaW5nSW5wdXRzOiBzdHJpbmdbXSA9IFtdO1xuXG4gICAgZm9yKGNvbnN0IHByb3Agb2YgT2JqZWN0LmtleXModGhpcykpIHtcbiAgICAgIGlmIChpc1JlcXVpcmVkKHRoaXMsIHByb3ApKSB7XG4gICAgICAgIGNvbnN0IGlucHV0TmFtZSA9IGdldElucHV0TmFtZSh0aGlzLCBwcm9wKTtcbiAgICAgICAgY29uc3QgdmFsdWUgPSBjb3JlLmdldElucHV0KGlucHV0TmFtZSk7XG5cbiAgICAgICAgaWYgKHZhbHVlLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgIG1pc3NpbmdJbnB1dHMucHVzaChpbnB1dE5hbWUpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCFSZWZsZWN0LnNldCh0aGlzLCBwcm9wLCB2YWx1ZSkpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEZhaWxlZCB0byBzZXQgdGhlIHZhbHVlIG9mIFsgJHtpbnB1dE5hbWV9IF0gZHVyaW5nIGFjdGlvbiBzZXR1cGApO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKG1pc3NpbmdJbnB1dHMubGVuZ3RoID4gMCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBNaXNzaW5nIHJlcXVpcmVkIGlucHV0cyBbICR7bWlzc2luZ0lucHV0cy5qb2luKCcsICcpfSBdLiBEaWQgeW91IHNldCB1c2luZyB0aGUgJ3dpdGgnIHByb3BlcnR5P2ApO1xuICAgIH1cbiAgfVxuXG4gIGxvYWRPcHRpb25hbCgpIHtcbiAgICBmb3IoY29uc3QgcHJvcCBvZiBPYmplY3Qua2V5cyh0aGlzKSkge1xuICAgICAgaWYgKGlzT3B0aW9uYWwodGhpcywgcHJvcCkpIHtcbiAgICAgICAgY29uc3QgaW5wdXROYW1lID0gZ2V0SW5wdXROYW1lKHRoaXMsIHByb3ApO1xuICAgICAgICBjb25zdCB2YWx1ZSA9IGNvcmUuZ2V0SW5wdXQoaW5wdXROYW1lKTtcbiAgICAgICAgUmVmbGVjdC5zZXQodGhpcywgcHJvcCwgdmFsdWUpO1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuIl19

/***/ }),

/***/ 909:
/***/ (function(__unusedmodule, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
__webpack_require__(307);
exports.RequiredSymbol = Symbol('required');
exports.OptionalSymbol = Symbol('optional');
exports.InputSymbol = Symbol('input');
exports.Required = Reflect.metadata(exports.RequiredSymbol, true);
exports.Optional = Reflect.metadata(exports.OptionalSymbol, true);
function Input(inputName) {
    return Reflect.metadata(exports.InputSymbol, inputName);
}
exports.Input = Input;
function isRequired(target, propertyKey) {
    return Reflect.getMetadata(exports.RequiredSymbol, target, propertyKey) || false;
}
exports.isRequired = isRequired;
function isOptional(target, propertyKey) {
    return Reflect.getMetadata(exports.OptionalSymbol, target, propertyKey) || false;
}
exports.isOptional = isOptional;
function getInputName(target, propertyKey) {
    return Reflect.getMetadata(exports.InputSymbol, target, propertyKey) || '';
}
exports.getInputName = getInputName;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVjb3JhdG9ycy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9kZWNvcmF0b3JzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsNEJBQTBCO0FBRWIsUUFBQSxjQUFjLEdBQUcsTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDO0FBQ3BDLFFBQUEsY0FBYyxHQUFHLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQztBQUNwQyxRQUFBLFdBQVcsR0FBRyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUM7QUFFOUIsUUFBQSxRQUFRLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQyxzQkFBYyxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQ2xELFFBQUEsUUFBUSxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsc0JBQWMsRUFBRSxJQUFJLENBQUMsQ0FBQztBQUUvRCxTQUFnQixLQUFLLENBQUMsU0FBaUI7SUFDckMsT0FBTyxPQUFPLENBQUMsUUFBUSxDQUFDLG1CQUFXLEVBQUUsU0FBUyxDQUFDLENBQUM7QUFDbEQsQ0FBQztBQUZELHNCQUVDO0FBRUQsU0FBZ0IsVUFBVSxDQUFDLE1BQVcsRUFBRSxXQUFtQjtJQUN6RCxPQUFPLE9BQU8sQ0FBQyxXQUFXLENBQUMsc0JBQWMsRUFBRSxNQUFNLEVBQUUsV0FBVyxDQUFDLElBQUksS0FBSyxDQUFDO0FBQzNFLENBQUM7QUFGRCxnQ0FFQztBQUVELFNBQWdCLFVBQVUsQ0FBQyxNQUFXLEVBQUUsV0FBbUI7SUFDekQsT0FBTyxPQUFPLENBQUMsV0FBVyxDQUFDLHNCQUFjLEVBQUUsTUFBTSxFQUFFLFdBQVcsQ0FBQyxJQUFJLEtBQUssQ0FBQztBQUMzRSxDQUFDO0FBRkQsZ0NBRUM7QUFFRCxTQUFnQixZQUFZLENBQUMsTUFBVyxFQUFFLFdBQW1CO0lBQzNELE9BQU8sT0FBTyxDQUFDLFdBQVcsQ0FBQyxtQkFBVyxFQUFFLE1BQU0sRUFBRSxXQUFXLENBQUMsSUFBSSxFQUFFLENBQUM7QUFDckUsQ0FBQztBQUZELG9DQUVDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICdyZWZsZWN0LW1ldGFkYXRhJztcblxuZXhwb3J0IGNvbnN0IFJlcXVpcmVkU3ltYm9sID0gU3ltYm9sKCdyZXF1aXJlZCcpO1xuZXhwb3J0IGNvbnN0IE9wdGlvbmFsU3ltYm9sID0gU3ltYm9sKCdvcHRpb25hbCcpO1xuZXhwb3J0IGNvbnN0IElucHV0U3ltYm9sID0gU3ltYm9sKCdpbnB1dCcpO1xuXG5leHBvcnQgY29uc3QgUmVxdWlyZWQgPSBSZWZsZWN0Lm1ldGFkYXRhKFJlcXVpcmVkU3ltYm9sLCB0cnVlKTtcbmV4cG9ydCBjb25zdCBPcHRpb25hbCA9IFJlZmxlY3QubWV0YWRhdGEoT3B0aW9uYWxTeW1ib2wsIHRydWUpO1xuXG5leHBvcnQgZnVuY3Rpb24gSW5wdXQoaW5wdXROYW1lOiBzdHJpbmcpIHtcbiAgcmV0dXJuIFJlZmxlY3QubWV0YWRhdGEoSW5wdXRTeW1ib2wsIGlucHV0TmFtZSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc1JlcXVpcmVkKHRhcmdldDogYW55LCBwcm9wZXJ0eUtleTogc3RyaW5nKTogYm9vbGVhbiB7XG4gIHJldHVybiBSZWZsZWN0LmdldE1ldGFkYXRhKFJlcXVpcmVkU3ltYm9sLCB0YXJnZXQsIHByb3BlcnR5S2V5KSB8fCBmYWxzZTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzT3B0aW9uYWwodGFyZ2V0OiBhbnksIHByb3BlcnR5S2V5OiBzdHJpbmcpOiBib29sZWFuIHtcbiAgcmV0dXJuIFJlZmxlY3QuZ2V0TWV0YWRhdGEoT3B0aW9uYWxTeW1ib2wsIHRhcmdldCwgcHJvcGVydHlLZXkpIHx8IGZhbHNlO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0SW5wdXROYW1lKHRhcmdldDogYW55LCBwcm9wZXJ0eUtleTogc3RyaW5nKTogc3RyaW5nIHtcbiAgcmV0dXJuIFJlZmxlY3QuZ2V0TWV0YWRhdGEoSW5wdXRTeW1ib2wsIHRhcmdldCwgcHJvcGVydHlLZXkpIHx8ICcnO1xufSJdfQ==

/***/ }),

/***/ 986:
/***/ (function(__unusedmodule, exports, __webpack_require__) {

"use strict";

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const tr = __webpack_require__(9);
/**
 * Exec a command.
 * Output will be streamed to the live console.
 * Returns promise with return code
 *
 * @param     commandLine        command to execute (can include additional args). Must be correctly escaped.
 * @param     args               optional arguments for tool. Escaping is handled by the lib.
 * @param     options            optional exec options.  See ExecOptions
 * @returns   Promise<number>    exit code
 */
function exec(commandLine, args, options) {
    return __awaiter(this, void 0, void 0, function* () {
        const commandArgs = tr.argStringToArray(commandLine);
        if (commandArgs.length === 0) {
            throw new Error(`Parameter 'commandLine' cannot be null or empty.`);
        }
        // Path to tool to execute should be first arg
        const toolPath = commandArgs[0];
        args = commandArgs.slice(1).concat(args || []);
        const runner = new tr.ToolRunner(toolPath, args, options);
        return runner.exec();
    });
}
exports.exec = exec;
//# sourceMappingURL=exec.js.map

/***/ })

/******/ });