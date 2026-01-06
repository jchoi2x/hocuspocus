"use client";

import type { HocuspocusProvider } from "@hocuspocus/provider";
import { Collaboration } from "@tiptap/extension-collaboration";
import { CollaborationCaret } from "@tiptap/extension-collaboration-caret";
import { EditorContent, useEditor } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";

const CollaborativeEditor = (props: {
	slug: string;
	provider: HocuspocusProvider;
}) => {
	const editor = useEditor(
		{
			extensions: [
				// make sure to turn off the undo-redo extension when using collaboration
				StarterKit.configure({
					undoRedo: false,
				}),
				Collaboration.configure({
					document: props.provider.document,
				}),
				CollaborationCaret.configure({
					provider: props.provider,
				}),
			],
			// immediatelyRender needs to be `false` when using SSR
			immediatelyRender: false,
			editorProps: {
				attributes: {
					class:
						"prose prose-lg max-w-none focus:outline-none min-h-[500px] p-8 bg-white/50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm",
				},
			},
		},
		[props.provider],
	);

	return <EditorContent editor={editor} />;
};

export default CollaborativeEditor;
