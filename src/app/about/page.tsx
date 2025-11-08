import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Card, CardContent } from "@/components/ui/card";

export default function AboutPage() {
  const aboutImage = PlaceHolderImages.find((p) => p.id === 'about-main');

  return (
    <div className="bg-card">
      <div className="container mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-extrabold tracking-tight text-center font-headline lg:text-5xl mb-12">
          About Rahmaniyyah
        </h1>

        {aboutImage && (
            <div className="mb-12 rounded-lg overflow-hidden shadow-xl">
                <Image
                    src={aboutImage.imageUrl}
                    alt={aboutImage.description}
                    data-ai-hint={aboutImage.imageHint}
                    width={1200}
                    height={800}
                    className="w-full h-auto object-cover"
                />
            </div>
        )}

        <Card>
            <CardContent className="p-8 md:p-12">
                 <div className="prose prose-lg max-w-none mx-auto text-foreground">
                    <p>
                        Al-Tariqa Al-Rahmaniyyah is a distinguished spiritual order founded upon the principles of the Quran and the Sunnah of Prophet Muhammad (peace be upon him). Our path emphasizes the purification of the soul (tazkiyat al-nafs), the attainment of spiritual excellence (ihsan), and a profound, living connection with Allah.
                    </p>
                    
                    <h2 className="font-headline">Our History</h2>
                    <p>
                        The Rahmaniyyah path traces its lineage back through an unbroken chain of esteemed scholars and saints to the Prophet himself. It was formally established to preserve and transmit the esoteric sciences of Islam, providing a structured methodology for spiritual aspirants to progress on their journey towards the Divine.
                    </p>
                    
                    <h2 className="font-headline">Our Mission</h2>
                    <p>
                        Our mission is to create a nurturing environment where individuals can cultivate their faith, deepen their spiritual understanding, and serve humanity. We aim to be a beacon of traditional Islamic knowledge and spirituality in the modern world, offering guidance, education, and a supportive community for seekers of all backgrounds.
                    </p>

                    <h2 className="font-headline">Our Vision</h2>
                    <p>
                        We envision a world where the timeless wisdom of the Islamic spiritual tradition enriches lives, fosters compassion, and inspires positive change. Through our programs, gatherings, and community outreach, we strive to embody the Prophetic example of mercy, knowledge, and service to all of creation.
                    </p>
                </div>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
