import {
    CancellationToken, DebugConfiguration, DiagnosticCollection,
    Disposable, Event, OutputChannel, Uri
} from 'vscode';
import { ITestingSettings, Product } from '../../common/types';
import { DebuggerTypeName } from '../../debugger/constants';
import { ConsoleType } from '../../debugger/types';
import { IPythonTestMessage, TestDataItem, WorkspaceTestStatus } from '../types';
import { CommandSource } from './constants';

export type TestProvider = 'nosetest' | 'pytest' | 'unittest';

export type TestDiscoveryOptions = {
    workspaceFolder: Uri;
    cwd: string;
    args: string[];
    token: CancellationToken;
    ignoreCache: boolean;
    outChannel: OutputChannel;
};

export type TestRunOptions = {
    workspaceFolder: Uri;
    cwd: string;
    tests: Tests;
    args: string[];
    testsToRun?: TestsToRun;
    token: CancellationToken;
    outChannel?: OutputChannel;
    debug?: boolean;
};

export type UnitTestParserOptions = TestDiscoveryOptions & { startDirectory: string };

export type TestFolder = TestResult & {
    resource: Uri;
    name: string;
    testFiles: TestFile[];
    nameToRun: string;
    folders: TestFolder[];
};
export enum TestType {
    testFile = 'testFile',
    testFolder = 'testFolder',
    testSuite = 'testSuite',
    testFunction = 'testFunction',
    testWorkspaceFolder = 'testWorkspaceFolder'
}
export type TestFile = TestResult & {
    resource: Uri;
    name: string;
    fullPath: string;
    functions: TestFunction[];
    suites: TestSuite[];
    nameToRun: string;
    xmlName: string;
    errorsWhenDiscovering?: string;
};

export type TestSuite = TestResult & {
    resource: Uri;
    name: string;
    functions: TestFunction[];
    suites: TestSuite[];
    isUnitTest: Boolean;
    isInstance: Boolean;
    nameToRun: string;
    xmlName: string;
};

export type TestFunction = TestResult & {
    resource: Uri;
    name: string;
    nameToRun: string;
    subtestParent?: SubtestParent;
};

export type SubtestParent = TestResult & {
    name: string;
    nameToRun: string;
    asSuite: TestSuite;
};

export type TestResult = Node & {
    status?: TestStatus;
    passed?: boolean;
    time: number;
    line?: number;
    file?: string;
    message?: string;
    traceback?: string;
    functionsPassed?: number;
    functionsFailed?: number;
    functionsDidNotRun?: number;
};

export type Node = {
    expanded?: Boolean;
};

export type FlattenedTestFunction = {
    testFunction: TestFunction;
    parentTestSuite?: TestSuite;
    parentTestFile: TestFile;
    xmlClassName: string;
};

export type FlattenedTestSuite = {
    testSuite: TestSuite;
    parentTestFile: TestFile;
    xmlClassName: string;
};

export type TestSummary = {
    passed: number;
    failures: number;
    errors: number;
    skipped: number;
};

export type Tests = {
    summary: TestSummary;
    testFiles: TestFile[];
    testFunctions: FlattenedTestFunction[];
    testSuites: FlattenedTestSuite[];
    testFolders: TestFolder[];
    rootTestFolders: TestFolder[];
};

export enum TestStatus {
    Unknown = 'Unknown',
    Discovering = 'Discovering',
    Idle = 'Idle',
    Running = 'Running',
    Fail = 'Fail',
    Error = 'Error',
    Skipped = 'Skipped',
    Pass = 'Pass'
}

export type TestsToRun = {
    testFolder?: TestFolder[];
    testFile?: TestFile[];
    testSuite?: TestSuite[];
    testFunction?: TestFunction[];
};

export type UnitTestProduct = Product.nosetest | Product.pytest | Product.unittest;

export interface ITestManagerService extends Disposable {
    getTestManager(): ITestManager | undefined;
    getTestWorkingDirectory(): string;
    getPreferredTestManager(): UnitTestProduct | undefined;
}

export const IWorkspaceTestManagerService = Symbol('IWorkspaceTestManagerService');

export interface IWorkspaceTestManagerService extends Disposable {
    getTestManager(resource: Uri): ITestManager | undefined;
    getTestWorkingDirectory(resource: Uri): string;
    getPreferredTestManager(resource: Uri): UnitTestProduct | undefined;
}

export type TestSettingsPropertyNames = {
    enabledName: keyof ITestingSettings;
    argsName: keyof ITestingSettings;
    pathName?: keyof ITestingSettings;
};

export const ITestsHelper = Symbol('ITestsHelper');

export interface ITestsHelper {
    parseProviderName(product: UnitTestProduct): TestProvider;
    parseProduct(provider: TestProvider): UnitTestProduct;
    getSettingsPropertyNames(product: Product): TestSettingsPropertyNames;
    flattenTestFiles(testFiles: TestFile[], workspaceFolder: string): Tests;
    placeTestFilesIntoFolders(tests: Tests, workspaceFolder: string): void;
    displayTestErrorMessage(message: string): void;
    shouldRunAllTests(testsToRun?: TestsToRun): boolean;
    mergeTests(items: Tests[]): Tests;
}

export const ITestVisitor = Symbol('ITestVisitor');

export interface ITestVisitor {
    visitTestFunction(testFunction: TestFunction): void;
    visitTestSuite(testSuite: TestSuite): void;
    visitTestFile(testFile: TestFile): void;
    visitTestFolder(testFile: TestFolder): void;
}

export const ITestCollectionStorageService = Symbol('ITestCollectionStorageService');

export interface ITestCollectionStorageService extends Disposable {
    onDidChange: Event<{ uri: Uri; data?: TestDataItem }>;
    getTests(wkspace: Uri): Tests | undefined;
    storeTests(wkspace: Uri, tests: Tests | null | undefined): void;
    findFlattendTestFunction(resource: Uri, func: TestFunction): FlattenedTestFunction | undefined;
    findFlattendTestSuite(resource: Uri, suite: TestSuite): FlattenedTestSuite | undefined;
    update(resource: Uri, item: TestDataItem): void;
}

export const ITestResultsService = Symbol('ITestResultsService');

export interface ITestResultsService {
    resetResults(tests: Tests): void;
    updateResults(tests: Tests): void;
}

export type LaunchOptions = {
    cwd: string;
    args: string[];
    testProvider: TestProvider;
    token?: CancellationToken;
    outChannel?: OutputChannel;
};

export const ITestDebugLauncher = Symbol('ITestDebugLauncher');

export interface ITestDebugLauncher {
    launchDebugger(options: LaunchOptions): Promise<void>;
}

export const ITestManagerFactory = Symbol('ITestManagerFactory');

export interface ITestManagerFactory extends Function {
    // tslint:disable-next-line:callable-types
    (testProvider: TestProvider, workspaceFolder: Uri, rootDirectory: string): ITestManager;
}
export const ITestManagerServiceFactory = Symbol('TestManagerServiceFactory');

export interface ITestManagerServiceFactory extends Function {
    // tslint:disable-next-line:callable-types
    (workspaceFolder: Uri): ITestManagerService;
}

export const ITestManager = Symbol('ITestManager');
export interface ITestManager extends Disposable {
    readonly status: TestStatus;
    readonly enabled: boolean;
    readonly workingDirectory: string;
    readonly workspaceFolder: Uri;
    diagnosticCollection: DiagnosticCollection;
    readonly onDidStatusChange: Event<WorkspaceTestStatus>;
    stop(): void;
    resetTestResults(): void;
    discoverTests(cmdSource: CommandSource, ignoreCache?: boolean, quietMode?: boolean, userInitiated?: boolean, clearTestStatus?: boolean): Promise<Tests>;
    runTest(cmdSource: CommandSource, testsToRun?: TestsToRun, runFailedTests?: boolean, debug?: boolean): Promise<Tests>;
}

export const ITestDiscoveryService = Symbol('ITestDiscoveryService');

export interface ITestDiscoveryService {
    discoverTests(options: TestDiscoveryOptions): Promise<Tests>;
}

export const ITestsParser = Symbol('ITestsParser');
export interface ITestsParser {
    parse(content: string, options: ParserOptions): Tests;
}

export type ParserOptions = TestDiscoveryOptions;

export const IUnitTestSocketServer = Symbol('IUnitTestSocketServer');
export interface IUnitTestSocketServer extends Disposable {
    on(event: string | symbol, listener: Function): this;
    removeListener(event: string | symbol, listener: Function): this;
    removeAllListeners(event?: string | symbol): this;
    start(options?: { port?: number; host?: string }): Promise<number>;
    stop(): void;
}

export type Options = {
    workspaceFolder: Uri;
    cwd: string;
    args: string[];
    outChannel?: OutputChannel;
    token: CancellationToken;
};

export const ITestRunner = Symbol('ITestRunner');
export interface ITestRunner {
    run(testProvider: TestProvider, options: Options): Promise<string>;
}

export enum PassCalculationFormulae {
    pytest,
    nosetests
}

export const IXUnitParser = Symbol('IXUnitParser');
export interface IXUnitParser {
    updateResultsFromXmlLogFile(tests: Tests, outputXmlFile: string, passCalculationFormulae: PassCalculationFormulae): Promise<void>;
}

export type PythonVersionInformation = {
    major: number;
    minor: number;
};

export const ITestMessageService = Symbol('ITestMessageService');
export interface ITestMessageService {
    getFilteredTestMessages(rootDirectory: string, testResults: Tests): Promise<IPythonTestMessage[]>;
}

export interface ITestDebugConfig extends DebugConfiguration {
    type: typeof DebuggerTypeName;
    request: 'test';

    pythonPath?: string;
    console?: ConsoleType;
    cwd?: string;
    env?: Record<string, string | undefined>;
    envFile?: string;

    // converted to DebugOptions:
    stopOnEntry?: boolean;
    showReturnValue?: boolean;
    redirectOutput?: boolean;  // default: true
    debugStdLib?: boolean;
    justMyCode?: boolean;
}
export const ITestContextService = Symbol('ITestContextService');
export interface ITestContextService extends Disposable {
    register(): void;
}

export const ITestsStatusUpdaterService = Symbol('ITestsStatusUpdaterService');
export interface ITestsStatusUpdaterService {
    updateStatusAsDiscovering(resource: Uri, tests?: Tests): void;
    updateStatusAsUnknown(resource: Uri, tests?: Tests): void;
    updateStatusAsRunning(resource: Uri, tests?: Tests): void;
    updateStatusAsRunningFailedTests(resource: Uri, tests?: Tests): void;
    updateStatusAsRunningSpecificTests(resource: Uri, testsToRun: TestsToRun, tests?: Tests): void;
    updateStatusOfRunningTestsAsIdle(resource: Uri, tests?: Tests): void;
    triggerUpdatesToTests(resource: Uri, tests?: Tests): void;
}
