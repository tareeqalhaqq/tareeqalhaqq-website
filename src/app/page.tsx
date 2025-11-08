
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex flex-col bg-gray-900 text-white min-h-screen">
      <header className="w-full py-3 bg-black/50 backdrop-blur-sm sticky top-0 z-20">
        <div className="container mx-auto text-center text-sm md:text-base">
          <p>
            PATH TO KNOWLEDGE PART 2
            <span className="mx-2 text-orange-400">•</span>
            With Ustadh Abdulrahman Hassan
          </p>
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center p-4">
        <div 
          className="w-full h-full absolute inset-0 bg-no-repeat bg-center bg-cover"
          style={{
            backgroundImage: "radial-gradient(ellipse at center, rgba(140, 93, 39, 0.4) 0%, rgba(0,0,0,0.8) 70%, #000 100%)",
            opacity: 0.8
          }}
        />

        <div className="relative z-10 text-center flex flex-col items-center max-w-4xl mx-auto">
            <div className="mb-6">
                <Image
                    src="https://firebasestudio.ai/_next/image?url=https%3A%2F%2Fstorage.googleapis.com%2Fstatic.invertase.io%2Fassets%2Frahmaniyyah%2Flogo.png&w=256&q=75"
                    alt="Al-Madrasatu Ar-Rahmaniyyah Logo"
                    width={150}
                    height={150}
                    className="mx-auto"
                />
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold font-headline text-white drop-shadow-md">
                Al-Madrasatu Ar-Raḥmāniyyah
            </h1>

            <div className="my-4">
                <p className="text-lg md:text-xl text-gray-300" style={{ fontFamily: 'Amiri, serif' }}>
                    وَيُزَكِّيهِمْ وَيُعَلِّمُهُمُ الْكِتَابَ وَالْحِكْمَةَ
                </p>
                <p className="text-sm text-gray-400 italic mt-1">
                    "He purifies them and teaches them the Book and wisdom"
                </p>
            </div>
            
            <div className="my-8">
                <Image
                    src="https://firebasestudio.ai/_next/image?url=https%3A%2F%2Fstorage.googleapis.com%2Fstatic.invertase.io%2Fassets%2Frahmaniyyah%2Fustadh.png&w=256&q=75"
                    alt="Ustadh Abdulrahman Hassan"
                    width={150}
                    height={150}
                    className="rounded-full border-4 border-white/20 shadow-xl"
                />
            </div>

            <div className="mb-6">
                <h2 className="text-3xl md:text-5xl font-bold uppercase tracking-wider flex items-center justify-center gap-4">
                    The Path to Knowledge
                    <span className="bg-orange-500 text-white text-xl md:text-2xl font-bold px-4 py-1 rounded-lg">
                        PART 2
                    </span>
                </h2>
                <p className="text-lg text-gray-300 mt-2">Led by Ustadh Abdulrahman Hassan</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 md:p-8 w-full max-w-2xl shadow-lg mb-8 border border-white/20">
                <p className="text-2xl md:text-3xl font-bold text-white">November 8-16, 2025</p>
                <p className="text-base md:text-lg text-gray-300 mt-1">Masjid Darussalam, West London Southall, UB2 5NS</p>
                <p className="text-sm text-orange-400 mt-3">Special Durus • 7:00 PM Daily</p>
            </div>
            
            <Button asChild size="lg" className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-lg px-10 py-6 rounded-full transition-transform hover:scale-105">
                <Link href="#">
                    Reserve Your Seat &rarr;
                </Link>
            </Button>
        </div>
      </main>
    </div>
  );
}
