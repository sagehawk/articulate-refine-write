
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { getActiveEssay, getEssayData, saveEssayData } from "@/utils/localStorage";
import { EssayData, Paragraph } from "@/types/essay";

const SeamlessEditor = () => {
  const navigate = useNavigate();
  const [essayData, setEssayData] = useState<EssayData | null>(null);
  const [paragraphs, setParagraphs] = useState<Paragraph[]>([]);
  const [activeParagraphId, setActiveParagraphId] = useState<string | null>(null);
  const [hoveredParagraphId, setHoveredParagraphId] = useState<string | null>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
    if (!data.paragraphs || Object.keys(data.paragraphs).length === 0) {
      const newParagraph: Paragraph = {
        id: `p-${Date.now()}`,
        content: "",
        order: 0,
      };
      setParagraphs([newParagraph]);
      setActiveParagraphId(newParagraph.id);
    } else {
      const loadedParagraphs = Object.values(data.paragraphs)
        .sort((a, b) => a.order - b.order);
      setParagraphs(loadedParagraphs);
      if (loadedParagraphs.length > 0) {
        setActiveParagraphId(loadedParagraphs[0].id);
      }
    }
  }, [navigate]);

  const autoSave = (updatedParagraphs: Paragraph[]) => {
    if (!essayData) return;

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      const updatedData = {
        ...essayData,
        paragraphs: updatedParagraphs.reduce((acc, p) => {
          acc[p.id] = p;
          return acc;
        }, {} as { [key: string]: Paragraph }),
      };
      saveEssayData(updatedData);
    }, 1000);
  };

  const handleContentChange = (id: string, content: string) => {
    const newParagraphs = paragraphs.map((p) =>
      p.id === id ? { ...p, content } : p
    );
    setParagraphs(newParagraphs);
    autoSave(newParagraphs);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>, id: string) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const currentParagraphIndex = paragraphs.findIndex((p) => p.id === id);
      const newParagraph: Paragraph = {
        id: `p-${Date.now()}`,
        content: "",
        order: currentParagraphIndex + 1,
      };

      const newParagraphs = [
        ...paragraphs.slice(0, currentParagraphIndex + 1),
        newParagraph,
        ...paragraphs.slice(currentParagraphIndex + 1),
      ].map((p, index) => ({ ...p, order: index }));

      setParagraphs(newParagraphs);
      setActiveParagraphId(newParagraph.id);
      autoSave(newParagraphs);
    }
  };

  const onDragEnd = (result: any) => {
    if (!result.destination) {
      return;
    }

    const items = Array.from(paragraphs);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    const updatedParagraphs = items.map((p, index) => ({ ...p, order: index }));
    setParagraphs(updatedParagraphs);
    autoSave(updatedParagraphs);
  };

  const getInstruction = (content: string) => {
    if (!content.includes(". ")) {
      return {
        title: "Write the first sentence",
        subtitle: "This will be the main point of your paragraph.",
      };
    }
    return {
      title: "Now, fill in the rest of the paragraph",
      subtitle: "Provide evidence, examples, and analysis to support your main point.",
    };
  };

  const renderParagraphContent = (content: string) => {
    const firstSentenceMatch = content.match(/([^.]+\.\s)/);
    if (firstSentenceMatch) {
      const firstSentence = firstSentenceMatch[1];
      const restOfParagraph = content.substring(firstSentence.length);
      return (
        <div
          className="w-full h-full text-lg leading-relaxed"
          dangerouslySetInnerHTML={{
            __html: `<span style="color: #22c55e;">${firstSentence}</span>${restOfParagraph}`,
          }}
        />
      );
    }
    return <div className="w-full h-full text-lg leading-relaxed">{content}</div>;
  };

  const activeParagraph = paragraphs.find((p) => p.id === activeParagraphId);
  const instruction = activeParagraph ? getInstruction(activeParagraph.content) : { title: "", subtitle: "" };

  return (
    <div className="flex h-screen bg-background text-foreground">
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="paragraphs">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="w-1/4 p-4 border-r border-border"
            >
              <h2 className="text-lg font-bold mb-4">Paragraphs</h2>
              {paragraphs.map((p, index) => (
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
      </DragDropContext>

      <div className="w-3/4 p-8 flex flex-col">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">{instruction.title}</h1>
          <p className="text-muted-foreground">{instruction.subtitle}</p>
        </div>
        <div className="space-y-4 flex-grow">
          {paragraphs.map((p) => (
            <div key={p.id} className="relative">
              <div
                contentEditable
                onBlur={(e) => handleContentChange(p.id, e.currentTarget.innerText)}
                onKeyDown={(e) => handleKeyDown(e, p.id)}
                onFocus={() => setActiveParagraphId(p.id)}
                onMouseOver={() => setHoveredParagraphId(p.id)}
                onMouseOut={() => setHoveredParagraphId(null)}
                className={`w-full p-4 rounded-md bg-card border border-transparent focus:outline-none focus:border-primary transition-opacity duration-300
                  ${activeParagraphId !== p.id && hoveredParagraphId !== p.id ? "opacity-30" : "opacity-100"}
                `}
                style={{ minHeight: "150px" }}
              >
                {renderParagraphContent(p.content)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SeamlessEditor;
