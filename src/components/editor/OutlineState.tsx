
export const OutlineState = () => {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="space-y-4 text-center">
        <h1 className="text-4xl sm:text-5xl font-bold text-foreground">Great! Now let's build your outline.</h1>
        <p className="text-xl sm:text-2xl text-muted-foreground max-w-3xl mx-auto">
          Add first sentences for each topic in the sidebar. Click on any sentence to start writing that paragraph.
        </p>
      </div>
      
      <div className="bg-primary/5 border-l-4 border-primary p-6 sm:p-8 rounded-r-lg">
        <h2 className="text-2xl sm:text-3xl font-semibold text-foreground mb-3">
          📝 Current Task: Add First Sentences
        </h2>
        <p className="text-lg sm:text-xl text-muted-foreground">
          Use the sidebar to add first sentences for each topic. These will become the foundation of your paragraphs.
        </p>
      </div>
    </div>
  );
};
