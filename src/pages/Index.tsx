import { Video } from 'lucide-react';
import { ConverterSlot } from '@/components/ConverterSlot';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
              <Video className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-foreground">Video Converter</h1>
              <p className="text-sm text-muted-foreground">Image + Audio → Video (4 Slots)</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Converter Grid - 4 slots */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          <ConverterSlot slotNumber={1} />
          <ConverterSlot slotNumber={2} />
          <ConverterSlot slotNumber={3} />
          <ConverterSlot slotNumber={4} />
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
