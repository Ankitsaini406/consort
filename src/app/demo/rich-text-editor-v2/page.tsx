'use client';

import React, { useState } from 'react';
import { RichTextEditor, SecureContentRenderer, type TextBlock } from '@/components/ui/rich-text-editor-v2';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Save, Eye, Code, FileText, Database, Shield, Zap } from 'lucide-react';

// Mock Firebase functions with enhanced data structure
const mockFirebaseOperations = {
  save: async (data: any) => {
    console.log('Saving to Firebase:', data);
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { success: true, id: 'mock-id-' + Date.now() };
  },
  
  load: async (id: string) => {
    console.log('Loading from Firebase:', id);
    await new Promise(resolve => setTimeout(resolve, 500));
    return {
      id,
      content: JSON.stringify([
        { 
          id: '1', 
          type: 'h1', 
          content: 'Enhanced Rich Text Editor v2',
          marks: [{ type: 'bold', start: 0, end: 8 }]
        },
        { 
          id: '2', 
          type: 'paragraph', 
          content: 'This is an enhanced version with grouped lists, security improvements, and future-proof inline formatting support.'
        },
        {
          id: '3',
          type: 'list',
          listType: 'bullet',
          items: [
            { id: '3a', content: 'Grouped bullet points in single blocks' },
            { id: '3b', content: 'Better UX with proper list handling' },
            { id: '3c', content: 'Security-focused with input sanitization' },
            { id: '3d', content: 'Future-ready with marks support' }
          ]
        },
        {
          id: '4',
          type: 'paragraph',
          content: 'Perfect for CMS applications with long-term maintenance requirements.'
        }
      ]),
      createdAt: new Date().toISOString()
    };
  }
};

export default function RichTextEditorV2Demo() {
  const [editorContent, setEditorContent] = useState('');
  const [savedContent, setSavedContent] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'editor' | 'preview' | 'json'>('editor');

  const handleSave = async () => {
    if (!editorContent.trim()) {
      alert('Please add some content before saving');
      return;
    }

    setLoading(true);
    try {
      const blocks = JSON.parse(editorContent) as TextBlock[];
      const dataToSave = {
        content: editorContent,
        blocks: blocks,
        plainText: blocks.map((block) => {
          if (block.type === 'list') {
            return block.items?.map(item => `• ${item.content}`).join('\n') || '';
          }
          return block.content || '';
        }).join('\n'),
        html: blocks.map((block) => {
          switch (block.type) {
            case 'h1':
              return `<h1>${block.content}</h1>`;
            case 'paragraph':
              return `<p>${block.content}</p>`;
            case 'list':
              const tag = block.listType === 'numbered' ? 'ol' : 'ul';
              const items = block.items?.map(item => `<li>${item.content}</li>`).join('') || '';
              return `<${tag}>${items}</${tag}>`;
            default:
              return '';
          }
        }).join(''),
        createdAt: new Date().toISOString()
      };

      const result = await mockFirebaseOperations.save(dataToSave);
      setSavedContent({ ...dataToSave, id: result.id });
      alert('Content saved successfully!');
    } catch (error) {
      console.error('Error saving content:', error);
      alert('Failed to save content');
    } finally {
      setLoading(false);
    }
  };

  const handleLoad = async () => {
    setLoading(true);
    try {
      const result = await mockFirebaseOperations.load('sample-id');
      setEditorContent(result.content);
      setSavedContent(result);
    } catch (error) {
      console.error('Error loading content:', error);
      alert('Failed to load content');
    } finally {
      setLoading(false);
    }
  };

  const getStatistics = () => {
    if (!editorContent) return { blocks: 0, headings: 0, paragraphs: 0, lists: 0, totalItems: 0 };
    
    try {
      const blocks = JSON.parse(editorContent) as TextBlock[];
      return {
        blocks: blocks.length,
        headings: blocks.filter(b => b.type === 'h1').length,
        paragraphs: blocks.filter(b => b.type === 'paragraph').length,
        lists: blocks.filter(b => b.type === 'list').length,
        totalItems: blocks.reduce((acc, block) => {
          if (block.type === 'list') {
            return acc + (block.items?.length || 0);
          }
          return acc;
        }, 0)
      };
    } catch {
      return { blocks: 0, headings: 0, paragraphs: 0, lists: 0, totalItems: 0 };
    }
  };

  const stats = getStatistics();

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-4xl font-bold text-gray-900">Rich Text Editor v2</h1>
          <Badge variant="secondary" className="flex items-center gap-1">
            <Shield className="h-3 w-3" />
            Secure
          </Badge>
          <Badge variant="secondary" className="flex items-center gap-1">
            <Zap className="h-3 w-3" />
            Enhanced
          </Badge>
        </div>
        <p className="text-gray-600">
          Enhanced version with grouped lists, security improvements, and future-proof inline formatting support.
          Perfect for CMS applications with long-term maintenance requirements.
        </p>
      </div>

      {/* Security Features */}
      <Card className="mb-6 border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-800">
            <Shield className="h-5 w-5" />
            Security Enhancements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-semibold text-green-800 mb-2">Input Sanitization</h4>
              <ul className="space-y-1 text-green-700">
                <li>• HTML tag removal</li>
                <li>• JavaScript protocol blocking</li>
                <li>• Event handler stripping</li>
                <li>• Data URI prevention</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-green-800 mb-2">Secure Rendering</h4>
              <ul className="space-y-1 text-green-700">
                <li>• React components instead of dangerouslySetInnerHTML</li>
                <li>• Content validation on load</li>
                <li>• Type-safe data structures</li>
                <li>• Controlled content output</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Editor Panel */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Enhanced Editor
            </CardTitle>
            <CardDescription>
              Grouped lists, better UX, and future-proof structure with marks support.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RichTextEditor
              value={editorContent}
              onChange={setEditorContent}
              placeholder="Start typing your content here..."
              minHeight="300px"
            />
            
            <div className="flex gap-2 mt-4">
              <Button onClick={handleSave} disabled={loading} className="flex items-center gap-2">
                <Save className="h-4 w-4" />
                {loading ? 'Saving...' : 'Save to Firebase'}
              </Button>
              <Button variant="outline" onClick={handleLoad} disabled={loading}>
                <Database className="h-4 w-4 mr-2" />
                Load Sample
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Preview Panel */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Preview & Data Structure
            </CardTitle>
            <CardDescription>
              See the enhanced data structure with grouped lists and security features.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 mb-4">
              <Button
                variant={viewMode === 'editor' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('editor')}
              >
                <FileText className="h-3 w-3 mr-1" />
                Stats
              </Button>
              <Button
                variant={viewMode === 'preview' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('preview')}
              >
                <Eye className="h-3 w-3 mr-1" />
                Preview
              </Button>
              <Button
                variant={viewMode === 'json' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('json')}
              >
                <Code className="h-3 w-3 mr-1" />
                JSON
              </Button>
            </div>

            <div className="border rounded-lg p-4 min-h-[300px] bg-gray-50">
              {viewMode === 'preview' && editorContent && (
                <div className="space-y-2">
                  {JSON.parse(editorContent).map((block: TextBlock) => (
                    <SecureContentRenderer key={block.id} block={block} />
                  ))}
                </div>
              )}
              
              {viewMode === 'json' && (
                <pre className="text-xs text-gray-600 overflow-auto whitespace-pre-wrap">
                  {editorContent ? JSON.stringify(JSON.parse(editorContent), null, 2) : 'No content'}
                </pre>
              )}
              
              {viewMode === 'editor' && (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Content Statistics</h3>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary">{stats.blocks} Blocks</Badge>
                      <Badge variant="secondary">{stats.headings} Headings</Badge>
                      <Badge variant="secondary">{stats.paragraphs} Paragraphs</Badge>
                      <Badge variant="secondary">{stats.lists} Lists</Badge>
                      <Badge variant="secondary">{stats.totalItems} List Items</Badge>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h3 className="font-semibold mb-2">Enhanced Features</h3>
                    <ul className="text-sm space-y-1 text-gray-600">
                      <li>• Grouped lists in single blocks</li>
                      <li>• Better JSON structure</li>
                      <li>• Future-proof marks field</li>
                      <li>• Input sanitization</li>
                      <li>• Secure React rendering</li>
                      <li>• Automatic migration from v1</li>
                    </ul>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h3 className="font-semibold mb-2">Keyboard Shortcuts</h3>
                    <ul className="text-sm space-y-1 text-gray-600">
                      <li>• <kbd className="px-1 py-0.5 bg-gray-200 rounded text-xs">Enter</kbd> - Create new paragraph</li>
                      <li>• <kbd className="px-1 py-0.5 bg-gray-200 rounded text-xs">Backspace</kbd> - Delete empty block</li>
                      <li>• <kbd className="px-1 py-0.5 bg-gray-200 rounded text-xs">Tab</kbd> - Navigate to next block</li>
                      <li>• <kbd className="px-1 py-0.5 bg-gray-200 rounded text-xs">Shift+Tab</kbd> - Navigate to previous block</li>
                      <li>• <kbd className="px-1 py-0.5 bg-gray-200 rounded text-xs">Backspace</kbd> at start - Merge with previous block</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data Structure Comparison */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Enhanced Data Structure</CardTitle>
          <CardDescription>
            Comparison between v1 and v2 data structures showing the improvements
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2 text-red-600">v1 Structure (Old)</h4>
              <pre className="text-xs bg-red-50 p-3 rounded border border-red-200 overflow-auto">
{`[
  {"id":"1","type":"h1","content":"Heading"},
  {"id":"2","type":"bullet","content":"Item 1"},
  {"id":"3","type":"bullet","content":"Item 2"},
  {"id":"4","type":"bullet","content":"Item 3"}
]`}
              </pre>
              <p className="text-xs text-red-600 mt-2">❌ Separate blocks for each bullet</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2 text-green-600">v2 Structure (Enhanced)</h4>
              <pre className="text-xs bg-green-50 p-3 rounded border border-green-200 overflow-auto">
{`[
  {
    "id":"1","type":"h1","content":"Heading",
    "marks":[{"type":"bold","start":0,"end":7}]
  },
  {
    "id":"2","type":"list","listType":"bullet",
    "items":[
      {"id":"2a","content":"Item 1"},
      {"id":"2b","content":"Item 2"},
      {"id":"2c","content":"Item 3"}
    ]
  }
]`}
              </pre>
              <p className="text-xs text-green-600 mt-2">✅ Grouped lists + future-proof marks</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* CSP Recommendation */}
      <Card className="mt-6 border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-blue-800">Recommended CSP Headers</CardTitle>
          <CardDescription className="text-blue-700">
            Add these Content Security Policy headers to your application for maximum security
          </CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="text-xs bg-blue-100 p-3 rounded border border-blue-200 overflow-auto text-blue-800">
{`// In your Next.js next.config.js
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: "default-src 'self'; script-src 'self' 'unsafe-eval'; style-src 'self' 'unsafe-inline';"
  }
];

export default {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
};`}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
} 