import { Hero } from "@/components/Hero";
import { DiagramSection } from "@/components/DiagramSection";
import { DecisionsSection } from "@/components/DecisionsSection";
import { ComparisonsSection } from "@/components/ComparisonsSection";
import { ScalingSection } from "@/components/ScalingSection";
import { IncidentSection } from "@/components/IncidentSection";
import { TimelineSection } from "@/components/TimelineSection";
import { PrinciplesSection } from "@/components/PrinciplesSection";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col bg-bg">
      <Hero />
      <main className="flex-1 divide-y divide-border">
        <DiagramSection />
        <DecisionsSection />
        <ComparisonsSection />
        <ScalingSection />
        <IncidentSection />
        <TimelineSection />
        <PrinciplesSection />
      </main>
      <Footer />
    </div>
  );
}
