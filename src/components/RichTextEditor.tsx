import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import { Button } from "@/components/ui/button";
import {
    Bold,
    Italic,
    List,
    ListOrdered,
    Quote,
    Undo,
    Redo,
    Code,
    Heading1,
    Heading2,
    Heading3,
    ImageIcon
} from 'lucide-react';
import { cn } from "@/lib/utils/misc";

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
};

const editorStyles = `
    .ProseMirror-wrapper {
        height: 100%;
        overflow-y: auto;
    }

    .ProseMirror {
        height: 100%;
        padding: 1rem;
    }
    
    .ProseMirror:focus {
        outline: none;
    }

    /* Scrollbar styling für WebKit Browser */
    .ProseMirror-wrapper::-webkit-scrollbar {
        width: 8px;
    }

    .ProseMirror-wrapper::-webkit-scrollbar-track {
        background: #f1f1f1;
        border-radius: 4px;
    }

    .ProseMirror-wrapper::-webkit-scrollbar-thumb {
        background: #888;
        border-radius: 4px;
    }

    .ProseMirror-wrapper::-webkit-scrollbar-thumb:hover {
        background: #666;
    }

    /* Rest der Styles bleiben gleich ... */
    .ProseMirror h1 {
        font-size: 1.875rem;
        font-weight: 700;
        line-height: 1.2;
        margin-top: 2rem;
        margin-bottom: 1rem;
        color: #1a1a1a;
    }
    
    .ProseMirror h2 {
        font-size: 1.5rem;
        font-weight: 600;
        line-height: 1.3;
        margin-top: 1.75rem;
        margin-bottom: 0.75rem;
        color: #1a1a1a;
    }
    
    .ProseMirror h3 {
        font-size: 1.25rem;
        font-weight: 600;
        line-height: 1.4;
        margin-top: 1.5rem;
        margin-bottom: 0.5rem;
        color: #1a1a1a;
    }

    .ProseMirror ul {
        list-style-type: disc;
        padding-left: 1.5em;
        margin: 1em 0;
    }

    .ProseMirror li p {
        margin: 0;
    }
    
    .ProseMirror ol {
        list-style-type: decimal;
        padding-left: 1.5em;
        margin: 1em 0;
    }

    .ProseMirror blockquote {
        border-left: 3px solid #e5e7eb;
        padding-left: 1rem;
        margin: 1em 0;
    }

    .ProseMirror pre {
        background-color: #f3f4f6;
        padding: 0.2em 0.4em;
        border-radius: 0.25em;
        font-size: 0.9em;
    }

    .ProseMirror p {
        margin: 1em 0;
        line-height: 1.6;
    }

    .ProseMirror > *:first-child {
        margin-top: 0;
    }

    .ProseMirror img {
        max-width: 100%;
        height: auto;
        margin: 1em 0;
        border-radius: 0.375rem;
        cursor: pointer;
    }

    .ProseMirror img.ProseMirror-selectednode {
        outline: 2px solid #2563eb;
    }

`;



interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    className?: string;
}

const RichTextEditor = ({ value, onChange, className }: RichTextEditorProps) => {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: {
                    levels: [1, 2, 3]
                }
            }),
            Image.configure({
                HTMLAttributes: {
                    class: 'cursor-pointer',
                },
                allowBase64: true,
            }),
        ],
        content: value,
        onUpdate: ({ editor }) => {
            const html = editor.getHTML();
            console.log('Editor content updated:', html); // Debug-Log
            onChange(html);
        },
        editorProps: {
            attributes: {
                class: 'prose prose-sm max-w-none focus:outline-none ProseMirror-wrapper'
            },
            handleDrop: (view, event, slice, moved) => {
                if (!moved && event.dataTransfer?.files?.length) {
                    const files = Array.from(event.dataTransfer.files);
                    const images = files.filter(file => file.type.startsWith('image/'));

                    if (images.length > 0) {
                        event.preventDefault();
                        
                        images.forEach(async (image) => {
                            try {
                                const base64 = await fileToBase64(image);
                                const { tr } = view.state;
                                const pos = view.posAtCoords({ 
                                    left: event.clientX, 
                                    top: event.clientY 
                                })?.pos || view.state.selection.from;
                                
                                view.dispatch(tr.insert(pos, view.state.schema.nodes.image.create({
                                    src: base64
                                })));
                                
                                // Explizit ein Update triggern
                                if (editor) {
                                    onChange(editor.getHTML());
                                }
                            } catch (error) {
                                console.error('Error handling image drop:', error);
                            }
                        });
                        
                        return false;
                    }
                }
                return false;
            },
            handlePaste: (view, event) => {
                if (event.clipboardData?.files?.length) {
                    const files = Array.from(event.clipboardData.files);
                    const images = files.filter(file => file.type.startsWith('image/'));

                    if (images.length > 0) {
                        event.preventDefault();
                        
                        images.forEach(async (image) => {
                            try {
                                const base64 = await fileToBase64(image);
                                const { tr } = view.state;
                                view.dispatch(tr.insert(
                                    view.state.selection.from,
                                    view.state.schema.nodes.image.create({ src: base64 })
                                ));
                                
                                // Explizit ein Update triggern
                                if (editor) {
                                    onChange(editor.getHTML());
                                }
                            } catch (error) {
                                console.error('Error handling image paste:', error);
                            }
                        });
                        
                        return false;
                    }
                }
                return false;
            },
        },
    });

    React.useEffect(() => {
        if (editor && value !== editor.getHTML()) {
            console.log('Editor content and value mismatch:', {
                value,
                editorContent: editor.getHTML()
            });
        }
    }, [editor, value]);
    
    const addImage = React.useCallback(async () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = async () => {
            const file = input.files?.[0];
            if (file && editor) {
                try {
                    const base64 = await fileToBase64(file);
                    editor.chain().focus().setImage({ src: base64 }).run();
                    // Explizit ein Update triggern
                    onChange(editor.getHTML());
                } catch (error) {
                    console.error('Error converting image:', error);
                }
            }
        };
        input.click();
    }, [editor, onChange]);

    const MenuBar = ({ editor }: { editor: any }) => {
        if (!editor) {
            return null;
        }
    
        const headingButtons = [
            { level: 1, icon: Heading1, title: "Heading 1 (Ctrl+Alt+1)" },
            { level: 2, icon: Heading2, title: "Heading 2 (Ctrl+Alt+2)" },
            { level: 3, icon: Heading3, title: "Heading 3 (Ctrl+Alt+3)" },
        ];
    
        return (
            <div className="border-b p-2">
                <div className="flex flex-wrap gap-1 mb-2">
                    {headingButtons.map(({ level, icon: Icon, title }) => (
                        <Button
                            key={level}
                            size="sm"
                            variant="ghost"
                            onClick={() => editor.chain().focus().toggleHeading({ level }).run()}
                            className={cn(
                                editor.isActive('heading', { level }) && 'bg-muted'
                            )}
                            title={title}
                        >
                            <Icon className="h-4 w-4" />
                        </Button>
                    ))}
                    <div className="w-px h-6 bg-border mx-1" />
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => editor.chain().focus().toggleBold().run()}
                        className={cn(editor.isActive('bold') && 'bg-muted')}
                        title="Bold (Ctrl+B)"
                    >
                        <Bold className="h-4 w-4" />
                    </Button>
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => editor.chain().focus().toggleItalic().run()}
                        className={cn(editor.isActive('italic') && 'bg-muted')}
                        title="Italic (Ctrl+I)"
                    >
                        <Italic className="h-4 w-4" />
                    </Button>
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => editor.chain().focus().toggleCode().run()}
                        className={cn(editor.isActive('code') && 'bg-muted')}
                        title="Code (Ctrl+E)"
                    >
                        <Code className="h-4 w-4" />
                    </Button>
                    <div className="w-px h-6 bg-border mx-1" />
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => editor.chain().focus().toggleBulletList().run()}
                        className={cn(editor.isActive('bulletList') && 'bg-muted')}
                        title="Bullet List"
                    >
                        <List className="h-4 w-4" />
                    </Button>
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => editor.chain().focus().toggleOrderedList().run()}
                        className={cn(editor.isActive('orderedList') && 'bg-muted')}
                        title="Numbered List"
                    >
                        <ListOrdered className="h-4 w-4" />
                    </Button>
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => editor.chain().focus().toggleBlockquote().run()}
                        className={cn(editor.isActive('blockquote') && 'bg-muted')}
                        title="Quote"
                    >
                        <Quote className="h-4 w-4" />
                    </Button>
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={addImage}
                        title="Add Image"
                    >
                        <ImageIcon className="h-4 w-4" />
                    </Button>
                    <div className="w-px h-6 bg-border mx-1" />
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => editor.chain().focus().undo().run()}
                        disabled={!editor.can().undo()}
                        title="Undo (Ctrl+Z)"
                    >
                        <Undo className="h-4 w-4" />
                    </Button>
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => editor.chain().focus().redo().run()}
                        disabled={!editor.can().redo()}
                        title="Redo (Ctrl+Y)"
                    >
                        <Redo className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        );
    };

    return (
        <div className={cn("flex flex-col h-full bg-white overflow-hidden", className)}>
            <style>{editorStyles}</style>
            <MenuBar editor={editor} />
            <div className="flex-1 min-h-0"> {/* min-h-0 ist wichtig für Flex-Scrolling */}
                <EditorContent editor={editor} className="h-full" />
            </div>
        </div>
    );
};

export default RichTextEditor;