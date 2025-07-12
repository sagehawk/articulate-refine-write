import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getActiveEssay, getEssayData, saveEssayData, createNewEssay } from "@/utils/localStorage";
import { EssayData } from "@/types/essay";
import { PreviewModal } from "@/components/PreviewModal";
import { EditorHeader } from "@/components/editor/EditorHeader";
import { EditorSidebar } from "@/components/editor/EditorSidebar";
import { InitialState } from "@/components/editor/InitialState";
import { OutlineState } from "@/components/editor/OutlineState";
import { ParagraphEditor } from "@/components/editor/ParagraphEditor";

type EditorState = 'initial' | 'outline' | 'paragraph';

const UnifiedEditor = () => {
  const navigate = useNavigate();
  const [essayData, setEssayData] = useState<EssayData | null>(null);
  const [editorState, setEditorState] = useState<EditorState>('initial');
  const [selectedTopicIndex, setSelectedTopicIndex] = useState<number | null>(null);
  const [selectedSentenceIndex, setSelectedSentenceIndex] = useState<number | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const activeEssayId = getActiveEssay();
    if (activeEssayId) {
      const data = getEssayData(activeEssayId);
      if (data) {
        setEssayData(data);
        if (data.topics.length > 0) {
          setEditorState('outline');
        }
      }
    } else {
      const newEssay = createNewEssay("Untitled Essay");
      setEssayData(newEssay);
    }
  }, []);

  const autoSave = useCallback((updatedData: EssayData) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    saveTimeoutRef.current = setTimeout(() => {
      saveEssayData(updatedData);
    }, 1000);
  }, []);

  const updateTitle = useCallback((newTitle: string) => {
    if (!essayData || !newTitle.trim()) return;
    
    const updatedData = {
      ...essayData,
      essay: { ...essayData.essay, title: newTitle }
    };
    setEssayData(updatedData);
    autoSave(updatedData);
  }, [essayData, autoSave]);

  const addTopicQuestion = useCallback((topic: string) => {
    if (!essayData) return;
    
    const updatedData = {
      ...essayData,
      topics: [...essayData.topics, topic]
    };
    setEssayData(updatedData);
    autoSave(updatedData);
    
    if (editorState === 'initial') {
      setEditorState('outline');
    }
  }, [essayData, autoSave, editorState]);

  const addFirstSentence = useCallback((topicIndex: number, sentence: string) => {
    if (!essayData) return;
    
    const updatedSentences = { ...essayData.sentences };
    if (!Array.isArray(updatedSentences[topicIndex])) {
      updatedSentences[topicIndex] = [];
    }
    updatedSentences[topicIndex].push(sentence);
    
    const updatedData = { ...essayData, sentences: updatedSentences };
    setEssayData(updatedData);
    autoSave(updatedData);
  }, [essayData, autoSave]);

  const updateParagraph = useCallback((content: string) => {
    if (!essayData || selectedTopicIndex === null || selectedSentenceIndex === null) return;
    
    const updatedParagraphs = { ...essayData.paragraphs };
    if (!Array.isArray(updatedParagraphs[selectedTopicIndex])) {
      updatedParagraphs[selectedTopicIndex] = [];
    }
    updatedParagraphs[selectedTopicIndex][selectedSentenceIndex] = content;
    
    const updatedData = { ...essayData, paragraphs: updatedParagraphs };
    setEssayData(updatedData);
    autoSave(updatedData);
  }, [essayData, selectedTopicIndex, selectedSentenceIndex, autoSave]);

  const editTopic = useCallback((topicIndex: number, newTopic: string) => {
    if (!essayData) return;
    
    const updatedTopics = [...essayData.topics];
    updatedTopics[topicIndex] = newTopic;
    
    const updatedData = { ...essayData, topics: updatedTopics };
    setEssayData(updatedData);
    autoSave(updatedData);
  }, [essayData, autoSave]);

  const editSentence = useCallback((topicIndex: number, sentenceIndex: number, newSentence: string) => {
    if (!essayData) return;
    
    const updatedSentences = { ...essayData.sentences };
    if (Array.isArray(updatedSentences[topicIndex])) {
      updatedSentences[topicIndex][sentenceIndex] = newSentence;
    }
    
    const updatedData = { ...essayData, sentences: updatedSentences };
    setEssayData(updatedData);
    autoSave(updatedData);
  }, [essayData, autoSave]);

  const handleSentenceClick = (topicIndex: number, sentenceIndex: number) => {
    setSelectedTopicIndex(topicIndex);
    setSelectedSentenceIndex(sentenceIndex);
    setEditorState('paragraph');
  };

  const getCurrentParagraphContent = () => {
    if (!essayData || selectedTopicIndex === null || selectedSentenceIndex === null) return "";
    
    const paragraphs = essayData.paragraphs[selectedTopicIndex];
    if (Array.isArray(paragraphs) && paragraphs[selectedSentenceIndex]) {
      return paragraphs[selectedSentenceIndex];
    }
    return "";
  };

  const onReorderTopics = useCallback((startIndex: number, endIndex: number) => {
    if (!essayData) return;
    const result = Array.from(essayData.topics);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);

    const updatedData = { ...essayData, topics: result };
    setEssayData(updatedData);
    autoSave(updatedData);
  }, [essayData, autoSave]);

  if (!essayData) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <EditorHeader
        title={essayData.essay.title}
        onTitleChange={updateTitle}
        onPreview={() => setIsPreviewOpen(true)}
        onAnalyze={() => navigate("/analysis")}
      />

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {editorState !== 'initial' && (
          <EditorSidebar
            essayData={essayData}
            selectedTopicIndex={selectedTopicIndex}
            selectedSentenceIndex={selectedSentenceIndex}
            onAddTopic={addTopicQuestion}
            onAddSentence={addFirstSentence}
            onSentenceClick={handleSentenceClick}
            onEditTopic={editTopic}
            onEditSentence={editSentence}
            onReorderTopics={onReorderTopics}
          />
        )}

        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-4xl mx-auto px-4 sm:px-8 py-6 sm:py-12">
              {editorState === 'initial' && (
                <InitialState onAddTopic={addTopicQuestion} />
              )}

              {editorState === 'outline' && <OutlineState />}

              {editorState === 'paragraph' && selectedTopicIndex !== null && selectedSentenceIndex !== null && (
                <ParagraphEditor
                  firstSentence={getCurrentFirstSentence()}
                  paragraphContent={getCurrentParagraphContent()}
                  onContentChange={updateParagraph}
                  onFirstSentenceChange={(newSentence) => editSentence(selectedTopicIndex, selectedSentenceIndex, newSentence)}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      <PreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        essayData={essayData}
      />
    </div>
  );
};

export default UnifiedEditor;
