import type {
	IncomingHttpHeaders,
	IncomingMessage as NodeIncomingMessage,
	ServerResponse,
} from "node:http";
import type { Duplex } from "node:stream";
import type { Awareness } from "y-protocols/awareness";
import type Connection from "./Connection.ts";
import type Document from "./Document.ts";
import type { Hocuspocus } from "./Hocuspocus.ts";

// Re-export Node.js types for use in core files
// This centralizes runtime-specific type imports in one location
export type { IncomingHttpHeaders, ServerResponse };
export type { NodeIncomingMessage as IncomingMessage };

/**
 * Context object that can be extended by hooks
 * Extensions can add any properties they need
 */
export type HookContext = Record<string, unknown>;

export enum MessageType {
	Unknown = -1,
	Sync = 0,
	Awareness = 1,
	Auth = 2,
	QueryAwareness = 3,
	SyncReply = 4, // same as Sync, but won't trigger another 'SyncStep1'
	Stateless = 5,
	BroadcastStateless = 6,
	CLOSE = 7,
	SyncStatus = 8,
}

export interface AwarenessUpdate {
	added: number[];
	updated: number[];
	removed: number[];
}

export interface ConnectionConfiguration {
	readOnly: boolean;
	isAuthenticated: boolean;
}

export interface Extension {
	priority?: number;
	extensionName?: string;
	onConfigure?(data: onConfigurePayload): Promise<void>;
	onListen?(data: onListenPayload): Promise<void>;
	onUpgrade?(data: onUpgradePayload): Promise<void>;
	onConnect?(data: onConnectPayload): Promise<HookContext | void>;
	connected?(data: connectedPayload): Promise<void>;
	onAuthenticate?(data: onAuthenticatePayload): Promise<HookContext | void>;
	onTokenSync?(data: onTokenSyncPayload): Promise<HookContext | void>;
	onCreateDocument?(data: onCreateDocumentPayload): Promise<Record<string, unknown> | void>;
	onLoadDocument?(data: onLoadDocumentPayload): Promise<void>;
	afterLoadDocument?(data: afterLoadDocumentPayload): Promise<void>;
	beforeHandleMessage?(data: beforeHandleMessagePayload): Promise<void>;
	beforeSync?(data: beforeSyncPayload): Promise<void>;
	beforeBroadcastStateless?(
		data: beforeBroadcastStatelessPayload,
	): Promise<void>;
	onStateless?(payload: onStatelessPayload): Promise<void>;
	onChange?(data: onChangePayload): Promise<void>;
	onStoreDocument?(data: onStoreDocumentPayload): Promise<void>;
	afterStoreDocument?(data: afterStoreDocumentPayload): Promise<void>;
	onAwarenessUpdate?(data: onAwarenessUpdatePayload): Promise<void>;
	onRequest?(data: onRequestPayload): Promise<void>;
	onDisconnect?(data: onDisconnectPayload): Promise<void>;
	beforeUnloadDocument?(data: beforeUnloadDocumentPayload): Promise<void>;
	afterUnloadDocument?(data: afterUnloadDocumentPayload): Promise<void>;
	onDestroy?(data: onDestroyPayload): Promise<void>;
}

export type HookName =
	| "onConfigure"
	| "onListen"
	| "onUpgrade"
	| "onConnect"
	| "connected"
	| "onAuthenticate"
	| "onTokenSync"
	| "onCreateDocument"
	| "onLoadDocument"
	| "afterLoadDocument"
	| "beforeHandleMessage"
	| "beforeBroadcastStateless"
	| "beforeSync"
	| "onStateless"
	| "onChange"
	| "onStoreDocument"
	| "afterStoreDocument"
	| "onAwarenessUpdate"
	| "onRequest"
	| "onDisconnect"
	| "beforeUnloadDocument"
	| "afterUnloadDocument"
	| "onDestroy";

export type HookPayloadByName = {
	onConfigure: onConfigurePayload;
	onListen: onListenPayload;
	onUpgrade: onUpgradePayload;
	onConnect: onConnectPayload;
	connected: connectedPayload;
	onAuthenticate: onAuthenticatePayload;
	onTokenSync: onTokenSyncPayload;
	onCreateDocument: onCreateDocumentPayload;
	onLoadDocument: onLoadDocumentPayload;
	afterLoadDocument: afterLoadDocumentPayload;
	beforeHandleMessage: beforeHandleMessagePayload;
	beforeBroadcastStateless: beforeBroadcastStatelessPayload;
	beforeSync: beforeSyncPayload;
	onStateless: onStatelessPayload;
	onChange: onChangePayload;
	onStoreDocument: onStoreDocumentPayload;
	afterStoreDocument: afterStoreDocumentPayload;
	onAwarenessUpdate: onAwarenessUpdatePayload;
	onRequest: onRequestPayload;
	onDisconnect: onDisconnectPayload;
	afterUnloadDocument: afterUnloadDocumentPayload;
	beforeUnloadDocument: beforeUnloadDocumentPayload;
	onDestroy: onDestroyPayload;
};

export interface Configuration extends Extension {
	/**
	 * A name for the instance, used for logging.
	 */
	name: string | null;
	/**
	 * A list of hocuspocus extensions.
	 */
	extensions: Array<Extension>;
	/**
	 * Defines in which interval the server sends a ping, and closes the connection when no pong is sent back.
	 */
	timeout: number;
	/**
	 * Debounces the call of the `onStoreDocument` hook for the given amount of time in ms.
	 * Otherwise every single update would be persisted.
	 */
	debounce: number;
	/**
	 * Makes sure to call `onStoreDocument` at least in the given amount of time (ms).
	 */
	maxDebounce: number;
	/**
	 * By default, the servers show a start screen. If passed false, the server will start quietly.
	 */
	quiet: boolean;
	/**
	 * If set to false, respects the debounce time of `onStoreDocument` before unloading a document.
	 * Otherwise, the document will be unloaded immediately.
	 *
	 * This prevents a client from DOSing the server by repeatedly connecting and disconnecting when
	 * your onStoreDocument is rate-limited.
	 */
	unloadImmediately: boolean;

	/**
	 * options to pass to the ydoc document
	 */
	yDocOptions: {
		gc: boolean; // enable or disable garbage collection (see https://github.com/yjs/yjs/blob/main/INTERNALS.md#deletions)
		gcFilter: () => boolean; // will be called before garbage collecting ; return false to keep it
	};
}

export interface onStatelessPayload {
	connection: Connection;
	documentName: string;
	document: Document;
	payload: string;
}

export interface onAuthenticatePayload {
	context: HookContext;
	documentName: string;
	instance: Hocuspocus;
	requestHeaders: IncomingHttpHeaders;
	requestParameters: URLSearchParams;
	request: NodeIncomingMessage;
	socketId: string;
	token: string;
	connectionConfig: ConnectionConfiguration;
}

export interface onTokenSyncPayload {
	context: HookContext;
	document: Document;
	documentName: string;
	instance: Hocuspocus;
	requestHeaders: IncomingHttpHeaders;
	requestParameters: URLSearchParams;
	socketId: string;
	token: string;
	connectionConfig: ConnectionConfiguration;
	connection: Connection;
}

export interface onCreateDocumentPayload {
	context: HookContext;
	documentName: string;
	instance: Hocuspocus;
	requestHeaders: IncomingHttpHeaders;
	requestParameters: URLSearchParams;
	socketId: string;
	connectionConfig: ConnectionConfiguration;
}

export interface onConnectPayload {
	context: HookContext;
	documentName: string;
	instance: Hocuspocus;
	request: NodeIncomingMessage;
	requestHeaders: IncomingHttpHeaders;
	requestParameters: URLSearchParams;
	socketId: string;
	connectionConfig: ConnectionConfiguration;
}

export interface connectedPayload {
	context: HookContext;
	documentName: string;
	instance: Hocuspocus;
	request: NodeIncomingMessage;
	requestHeaders: IncomingHttpHeaders;
	requestParameters: URLSearchParams;
	socketId: string;
	connectionConfig: ConnectionConfiguration;
	connection: Connection;
}

export interface onLoadDocumentPayload {
	context: HookContext;
	document: Document;
	documentName: string;
	instance: Hocuspocus;
	requestHeaders: IncomingHttpHeaders;
	requestParameters: URLSearchParams;
	socketId: string;
	connectionConfig: ConnectionConfiguration;
}

export interface afterLoadDocumentPayload {
	context: HookContext;
	document: Document;
	documentName: string;
	instance: Hocuspocus;
	requestHeaders: IncomingHttpHeaders;
	requestParameters: URLSearchParams;
	socketId: string;
	connectionConfig: ConnectionConfiguration;
}

export interface onChangePayload {
	clientsCount: number;
	context: HookContext;
	document: Document;
	documentName: string;
	instance: Hocuspocus;
	requestHeaders: IncomingHttpHeaders;
	requestParameters: URLSearchParams;
	update: Uint8Array;
	socketId: string;
	transactionOrigin: Connection | string | undefined;
}

export interface beforeHandleMessagePayload {
	clientsCount: number;
	context: HookContext;
	document: Document;
	documentName: string;
	instance: Hocuspocus;
	requestHeaders: IncomingHttpHeaders;
	requestParameters: URLSearchParams;
	update: Uint8Array;
	socketId: string;
	connection: Connection;
}

export interface beforeSyncPayload {
	clientsCount: number;
	context: HookContext;
	document: Document;
	documentName: string;
	connection: Connection;
	/**
	 * The y-protocols/sync message type
	 * @example
	 * 0: SyncStep1
	 * 1: SyncStep2
	 * 2: YjsUpdate
	 *
	 * @see https://github.com/yjs/y-protocols/blob/master/sync.js#L13-L40
	 */
	type: number;
	/**
	 * The payload of the y-sync message.
	 */
	payload: Uint8Array;
}

export interface beforeBroadcastStatelessPayload {
	document: Document;
	documentName: string;
	payload: string;
}

export interface onStoreDocumentPayload {
	clientsCount: number;
	context: HookContext;
	document: Document;
	documentName: string;
	instance: Hocuspocus;
	requestHeaders: IncomingHttpHeaders;
	requestParameters: URLSearchParams;
	socketId: string;
	transactionOrigin?: Connection | string;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface, @typescript-eslint/no-empty-object-type
export interface afterStoreDocumentPayload extends onStoreDocumentPayload {}

export interface onAwarenessUpdatePayload {
	context: HookContext;
	document: Document;
	documentName: string;
	instance: Hocuspocus;
	requestHeaders: IncomingHttpHeaders;
	requestParameters: URLSearchParams;
	socketId: string;
	added: number[];
	updated: number[];
	removed: number[];
	awareness: Awareness;
	states: StatesArray;
}

export type StatesArray = { clientId: number; [key: string | number]: unknown }[];

export interface fetchPayload {
	context: HookContext;
	document: Document;
	documentName: string;
	instance: Hocuspocus;
	requestHeaders: IncomingHttpHeaders;
	requestParameters: URLSearchParams;
	socketId: string;
	connectionConfig: ConnectionConfiguration;
}

export interface storePayload extends onStoreDocumentPayload {
	state: Buffer;
}

export interface onDisconnectPayload {
	clientsCount: number;
	context: HookContext;
	document: Document;
	documentName: string;
	instance: Hocuspocus;
	requestHeaders: IncomingHttpHeaders;
	requestParameters: URLSearchParams;
	socketId: string;
}

export interface onRequestPayload {
	request: NodeIncomingMessage;
	response: ServerResponse;
	instance: Hocuspocus;
}

export interface onUpgradePayload {
	request: NodeIncomingMessage;
	socket: Duplex;
	head: Buffer;
	instance: Hocuspocus;
}

export interface onListenPayload {
	instance: Hocuspocus;
	configuration: Configuration;
	port: number;
}

export interface onDestroyPayload {
	instance: Hocuspocus;
}

export interface onConfigurePayload {
	instance: Hocuspocus;
	configuration: Configuration;
	version: string;
}

export interface afterUnloadDocumentPayload {
	instance: Hocuspocus;
	documentName: string;
}

export interface beforeUnloadDocumentPayload {
	instance: Hocuspocus;
	documentName: string;
	document: Document;
}

export interface DirectConnection {
	transact(transaction: (document: Document) => void): Promise<void>;
	disconnect(): void;
}
