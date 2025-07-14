import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { getActiveEssay, getEssayData, saveEssayData } from "@/utils/localStorage";
import { EssayData, Paragraph, Topic } from "@/types/essay";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

const SeamlessEditor = () => {
  const navigate = useNavigate();
  const [essayData, setEssayData] = useState<EssayData | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [paragraphs, setParagraphs] = useState<Paragraph[]>([]);
  const [activeParagraphId, setActiveParagraphId] = useState<string | null>(null);
  const [hoveredParagraphId, setHoveredParagraphId] = useState<string | null>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const textareaRefs = useRef<{ [key: string]: HTMLTextAreaElement | null }>({});

  useEffect(() => {
    const activeEssayId = getActiveEssay();
    if (!activeEssayId) {
      navigate("/");
      return;
    }

    const data = getEssayData(activeEssayId);
    if (!data) {
      navigate("/");
      return;
    }

    setEssayData(data);
    const loadedTopics = Object.values(data.topics || {}).sort((a, b) => a.order - b.order);
    const loadedParagraphs = Object.values(data.paragraphs || {}).sort((a, b) => a.order - b.order);

    setTopics(loadedTopics);
    setParagraphs(loadedParagraphs);

    if (loadedTopics.length === 0) {
      const newTopic: Topic = {
        id: `t-${Date.now()}`,
        title: "Introduction",
        order: 0,
      };
      const newParagraph: Paragraph = {
        id: `p-${Date.now()}`,
        topicId: newTopic.id,
        content: "",
        order: 0,
      };
      setTopics([newTopic]);
      setParagraphs([newParagraph]);
      setActiveParagraphId(newParagraph.id);
    } else if (loadedParagraphs.length > 0) {
      setActiveParagraphId(loadedParagraphs[0].id);
    }
  }, [navigate]);

  const autoSave = (updatedTopics: Topic[], updatedParagraphs: Paragraph[]) => {
    if (!essayData) return;

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      const updatedData = {
        ...essayData,
        topics: updatedTopics.reduce((acc, t) => {
          acc[t.id] = t;
          return acc;
        }, {} as { [key: string]: Topic }),
        paragraphs: updatedParagraphs.reduce((acc, p) => {
          acc[p.id] = p;
          return acc;
        }, {} as { [key: string]: Paragraph }),
      };
      saveEssayData(updatedData);
    }, 1000);
  };

  const handleTopicChange = (id: string, title: string) => {
    const newTopics = topics.map((t) => (t.id === id ? { ...t, title } : t));
    setTopics(newTopics);
    autoSave(newTopics, paragraphs);
  };

  const handleParagraphChange = (id: string, content: string) => {
    const newParagraphs = paragraphs.map((p) =>
      p.id === id ? { ...p, content } : p
    );
    setParagraphs(newParagraphs);
    autoSave(topics, newParagraphs);
  };

  const addTopic = () => {
    const newTopic: Topic = {
      id: `t-${Date.now()}`,
      title: "New Topic",
      order: topics.length,
    };
    const newParagraph: Paragraph = {
      id: `p-${Date.now()}`,
      topicId: newTopic.id,
      content: "",
      order: 0,
    };
    const newTopics = [...topics, newTopic];
    const newParagraphs = [...paragraphs, newParagraph];
    setTopics(newTopics);
    setParagraphs(newParagraphs);
    setActiveParagraphId(newParagraph.id);
    autoSave(newTopics, newParagraphs);
  };

  const addParagraph = (topicId: string) => {
    const topicParagraphs = paragraphs.filter((p) => p.topicId === topicId);
    const newParagraph: Paragraph = {
      id: `p-${Date.now()}`,
      topicId,
      content: "",
      order: topicParagraphs.length,
    };
    const newParagraphs = [...paragraphs, newParagraph];
    setParagraphs(newParagraphs);
    setActiveParagraphId(newParagraph.id);
    autoSave(topics, newParagraphs);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>, paragraph: Paragraph) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addParagraph(paragraph.topicId);
    }
  };

  const onDragEnd = (result: any) => {
    if (!result.destination) return;

    const { source, destination, type } = result;

    if (type === "topic") {
      const reorderedTopics = Array.from(topics);
      const [movedTopic] = reorderedTopics.splice(source.index, 1);
      reorderedTopics.splice(destination.index, 0, movedTopic);

      const updatedTopics = reorderedTopics.map((t, index) => ({ ...t, order: index }));
      setTopics(updatedTopics);
      autoSave(updatedTopics, paragraphs);
    } else if (type === "paragraph") {
      const sourceTopicId = source.droppableId;
      const destTopicId = destination.droppableId;

      const sourceParagraphs = paragraphs.filter(p => p.topicId === sourceTopicId);
      const destParagraphs = paragraphs.filter(p => p.topicId === destTopicI d);

      const [movedParagraph] = sourceParagraphs.splice(source.index, 1);

      if (sourceTopicId === destTopicId) {
        sourceParagraphs.splice(destination.index, 0, movedParagraph);
        const reordered = paragraphs.map(p => {
          const newOrder = sourceParagraphs.findIndex(sp => sp.id === p.id);
          if (newOrder !== -1) {
            return { ...p, order: newOrder };
          }
          return p;
        });
        setParagraphs(reordered);
        autoSave(topics, reordered);
      } else {
        movedParagraph.topicId = destTopicId;
        destParagraphs.splice(destination.index, 0, movedParagraph);

        const updatedParagraphs = [...paragraphs.filter(p => p.id !== movedParagraph.id), ...sourceParagraphs, ...destParagraphs].map((p, index) => ({ ...p, order: index }));
        setParagraphs(updatedParagraphs);
        autoSave(topics, updatedParagraphs);
      }
    }
  };

  return (
    <div className="flex h-screen bg-background text-foreground">
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="w-1/4 p-4 border-r border-border flex flex-col">
          <h2 className="text-lg font-bold mb-4">Outline</h2>
          <Button onClick={addTopic} variant="outline" className="mb-4">
            <Plus className="w-4 h-4 mr-2" />
            Add Topic
          </Button>
          <div className="overflow-y-auto flex-grow">
            <Droppable droppableId="all-topics" type="topic">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef}>
                  <Accordion type="multiple" className="w-full">
                    {topics.map((topic, index) => (
                      <Draggable key={topic.id} draggableId={topic.id} index={index}>
                        {(provided) => (
                          <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                            <AccordionItem value={topic.id}>
                              <AccordionTrigger>{topic.title}</AccordionTrigger>
                              <AccordionContent>
                                <Droppable droppableId={topic.id} type="paragraph">
                                  {(provided) => (
                                    <div {...provided.droppableProps} ref={provided.innerRef}>
                                      {paragraphs
                                        .filter((p) => p.topicId === topic.id)
                                        .sort((a, b) => a.order - b.order)
                                        .map((p, index) => (
                                          <Draggable key={p.id} draggableId={p.id} index={index}>
                                            {(provided) => (
                                              <div
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                {...provided.dragHandleProps}
                                                className="p-2 mb-2 rounded-md bg-card"
                                              >
                                                <p className="truncate">{p.content || "New Paragraph"}</p>
                                              </div>
                                            )}
                                          </Draggable>
                                        ))}
                                      {provided.placeholder}
                                    </div>
                                  )}
                                </Droppable>
                              </AccordionContent>
                            </AccordionItem>
                          </div>
                        )}
                      </Draggable>
                    ))}
                  </Accordion>
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        </div>

        <div className="w-3/4 p-8 flex flex-col overflow-y-auto">
          {topics.map((topic) => (
            <div key={topic.id} className="mb-8">
              <input
                type="text"
                value={topic.title}
                onChange={(e) => handleTopicChange(topic.id, e.target.value)}
                className="text-2xl font-bold bg-transparent border-b-2 border-transparent focus:outline-none focus:border-primary mb-4 w-full"
              />
              {paragraphs
                .filter((p) => p.topicId === topic.id)
                .sort((a, b) => a.order - b.order)
                .map((p) => (
                  <div
                    key={p.id}
                    className="relative mb-4"
                    onMouseOver={() => setHoveredParagraphId(p.id)}
                    onMouseOut={() => setHoveredParagraphId(null)}
                  >
                    <div
                      className={`absolute inset-0 p-4 text-lg leading-relaxed pointer-events-none transition-opacity duration-300
                        ${activeParagraphId !== p.id && hoveredParagraphId !== p.id ? "opacity-30" : "opacity-100"}
                      `}
                      aria-hidden="true"
                    >
                      {p.content}
                    </div>
                    <textarea
                      ref={(el) => (textareaRefs.current[p.id] = el)}
                      value={p.content}
                      onChange={(e) => handleParagraphChange(p.id, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, p)}
                      onFocus={() => setActiveParagraphId(p.id)}
                      className={`w-full p-4 rounded-md bg-transparent border border-transparent focus:outline-none focus:border-primary text-lg leading-relaxed resize-none
                        text-transparent caret-white transition-opacity duration-300
                        ${activeParagraphId !== p.id && hoveredParagraphId !== p.id ? "opacity-30" : "opacity-100"}
                      `}
                      style={{ minHeight: "150px" }}
                      onScroll={(e) => {
                        const target = e.target as HTMLTextAreaElement;
                        const overlay = target.previousSibling as HTMLDivElement;
                        if (overlay) {
                          overlay.scrollTop = target.scrollTop;
                        }
                      }}
                    />
                  </div>
                ))}
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
};

export default SeamlessEditor;