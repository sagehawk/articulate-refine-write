import { useState, useEffect, useRef } from "react";
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

  const autoSave = (updatedData: EssayData) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    saveTimeoutRef.current = setTimeout(() => {
      saveEssayData(updatedData);
    }, 1000);
  };

  const updateTitle = (newTitle: string) => {
    if (!essayData || !newTitle.trim()) return;
    
    const updatedData = {
      ...essayData,
      essay: { ...essayData.essay, title: newTitle }
    };
    setEssayData(updatedData);
    autoSave(updatedData);
  };

  const addTopicQuestion = (topic: string) => {
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
  };

  const addFirstSentence = (topicIndex: number, sentence: string) => {
    if (!essayData) return;
    
    const updatedSentences = { ...essayData.sentences };
    if (!Array.isArray(updatedSentences[topicIndex])) {
      updatedSentences[topicIndex] = [];
    }
    updatedSentences[topicIndex].push(sentence);
    
    const updatedData = { ...essayData, sentences: updatedSentences };
    setEssayData(updatedData);
    autoSave(updatedData);
  };

  const updateParagraph = (content: string) => {
    if (!essayData || selectedTopicIndex === null || selectedSentenceIndex === null) return;
    
    const updatedParagraphs = { ...essayData.paragraphs };
    if (!Array.isArray(updatedParagraphs[selectedTopicIndex])) {
      updatedParagraphs[selectedTopicIndex] = [];
    }
    updatedParagraphs[selectedTopicIndex][selectedSentenceIndex] = content;
    
    const updatedData = { ...essayData, paragraphs: updatedParagraphs };
    setEssayData(updatedData);
    autoSave(updatedData);
  };

  const editTopic = (topicIndex: number, newTopic: string) => {
    if (!essayData) return;
    
    const updatedTopics = [...essayData.topics];
    updatedTopics[topicIndex] = newTopic;
    
    const updatedData = { ...essayData, topics: updatedTopics };
    setEssayData(updatedData);
    autoSave(updatedData);
  };

  const editSentence = (topicIndex: number, sentenceIndex: number, newSentence: string) => {
    if (!essayData) return;
    
    const updatedSentences = { ...essayData.sentences };
    if (Array.isArray(updatedSentences[topicIndex])) {
      updatedSentences[topicIndex][sentenceIndex] = newSentence;
    }
    
    const updatedData = { ...essayData, sentences: updatedSentences };
    setEssayData(updatedData);
    autoSave(updatedData);
  };

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

  const getCurrentFirstSentence = () => {
    if (!essayData || selectedTopicIndex === null || selectedSentenceIndex === null) return "";
    
    const sentences = essayData.sentences[selectedTopicIndex];
    if (Array.isArray(sentences) && sentences[selectedSentenceIndex]) {
      return sentences[selectedSentenceIndex];
    }
    return "";
  };

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
