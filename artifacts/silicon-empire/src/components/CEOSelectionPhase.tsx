import { useGameStore } from "@/store/gameStore";
import { useT } from "@/hooks/useT";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Zap, TrendingUp, Cog } from "lucide-react";

export function CEOSelectionPhase() {
  const { selectCEOBackground } = useGameStore();
  const { t } = useT();

  const backgrounds = [
    {
      id: "visionary",
      titleEn: "The Visionary",
      titleTh: "ผู้มีวิสัยทัศน์",
      descEn: "Drives R&D innovation with premium market positioning. Strong brand loyalty.",
      descTh: "เน้นวิจัยและนวัตกรรม ตำแหน่งตลาด premium ที่แข็งแกร่ง",
      benefits: [
        "EcoTech +25%",
        "Brand segment +15%",
        "Price ceiling +10%",
        "E-Waste penalty −15%"
      ],
      icon: Zap,
      color: "from-amber-500 to-orange-600"
    },
    {
      id: "marketer",
      titleEn: "The Marketing Tycoon",
      titleTh: "นักตลาดชั้นนำ",
      descEn: "Maximizes brand loyalty with cost efficiency. Dominates Brand Loyalist segment.",
      descTh: "เพิ่มแรงจากแบรนด์ + ลดต้นทุน ครองส่วน Brand Loyalist",
      benefits: [
        "Brand segment +30%",
        "Production cost −10%",
        "Budget segment boost",
        "Market expansion specialist"
      ],
      icon: TrendingUp,
      color: "from-blue-500 to-cyan-600"
    },
    {
      id: "operator",
      titleEn: "The Supply Chain Master",
      titleTh: "ปราชญ์ซัพพลายเชน",
      descEn: "Optimizes production efficiency and inventory management. Minimal waste.",
      descTh: "ประสิทธิภาพการผลิต + บริหารสินค้าคงคลัง ลดสูญเสีย",
      benefits: [
        "Production cost −15%",
        "E-Waste penalty −30%",
        "Inventory mastery",
        "Operational excellence"
      ],
      icon: Cog,
      color: "from-green-500 to-emerald-600"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/30 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-3 tracking-tight">
            {t("ceo_selection.title")}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t("ceo_selection.subtitle")}
          </p>
        </div>

        {/* Career Selection Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {backgrounds.map((bg) => {
            const Icon = bg.icon;
            return (
              <Card
                key={bg.id}
                className="relative overflow-hidden group hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/50 cursor-pointer"
                onClick={() => selectCEOBackground(bg.id as any)}
              >
                {/* Background Gradient */}
                <div className={`absolute inset-0 opacity-0 group-hover:opacity-5 bg-gradient-to-br ${bg.color} transition-opacity duration-300`} />

                {/* Content */}
                <div className="relative p-6 h-full flex flex-col">
                  {/* Icon */}
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-br ${bg.color} mb-4`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>

                  {/* Title */}
                  <h2 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                    {bg.titleTh}
                  </h2>
                  <p className="text-sm text-muted-foreground mb-0.5">
                    {bg.titleEn}
                  </p>

                  {/* Description */}
                  <p className="text-sm text-foreground/70 mb-4 flex-grow">
                    {bg.descTh}
                  </p>

                  {/* Benefits */}
                  <div className="space-y-2 mb-6 pt-4 border-t border-border/50">
                    {bg.benefits.map((benefit, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 bg-gradient-to-r ${bg.color}`} />
                        <span className="text-xs font-medium text-muted-foreground">
                          {benefit}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Button */}
                  <Button
                    onClick={() => selectCEOBackground(bg.id as any)}
                    className="w-full h-10 font-semibold"
                  >
                    {t("ceo_selection.select")}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Info Footer */}
        <div className="bg-muted/50 border border-border/50 rounded-lg p-4 text-center text-sm text-muted-foreground">
          {t("ceo_selection.info")}
        </div>
      </div>
    </div>
  );
}
