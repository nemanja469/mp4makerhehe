import { useRef } from 'react';
import { Video, Play } from 'lucide-react';
import { ConverterSlot, ConverterSlotRef } from '@/components/ConverterSlot';

const Index = () => {
  const slotRefs = useRef<(ConverterSlotRef | null)[]>([null, null, null, null, null, null, null, null]);

  const handleStartAll = () => {
    slotRefs.current.forEach(ref => {
      if (ref?.canStart()) {
        ref.start();
      }
    });
  };

  const readySlotsCount = slotRefs.current.filter(ref => ref?.canStart()).length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <Video className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-foreground">Video Converter</h1>
                <p className="text-sm text-muted-foreground">Image + Audio → Video (8 Slots)</p>
              </div>
            </div>
            <button
              onClick={handleStartAll}
              className="btn-primary flex items-center gap-2 px-4 py-2"
            >
              <Play className="w-4 h-4" />
              Start All
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Converter Grid - 4 slots */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          <ConverterSlot ref={el => slotRefs.current[0] = el} slotNumber={1} />
          <ConverterSlot ref={el => slotRefs.current[1] = el} slotNumber={2} />
          <ConverterSlot ref={el => slotRefs.current[2] = el} slotNumber={3} />
          <ConverterSlot ref={el => slotRefs.current[3] = el} slotNumber={4} />
          <ConverterSlot ref={el => slotRefs.current[4] = el} slotNumber={5} />
          <ConverterSlot ref={el => slotRefs.current[5] = el} slotNumber={6} />
          <ConverterSlot ref={el => slotRefs.current[6] = el} slotNumber={7} />
          <ConverterSlot ref={el => slotRefs.current[7] = el} slotNumber={8} />
        </div>

        {/* Info Section */}
        <section className="text-center py-8">
          <p className="text-xs text-muted-foreground">
            All processing happens locally in your browser. Each slot runs independently—start all 4 at once!
          </p>
        </section>
      </main>
    </div>
  );
};

export default Index;
