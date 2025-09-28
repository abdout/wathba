import Image from "next/image";
import PublicLayoutWithTranslations from "@/components/PublicLayoutWithTranslations";
import { getDictionary } from "@/components/internationalization/dictionaries";
import OptimizedImage from "@/components/OptimizedImage";
import whoImage from "@/assets/who.jpg";
import whyImage from "@/assets/why.jpg";

// Prevent pre-rendering on server due to Redux in layout
export const dynamic = 'force-dynamic';

export default async function AboutPage({ params }) {
    const { lang } = await params;
    const dict = await getDictionary(lang);

    return (
        <PublicLayoutWithTranslations dict={dict} lang={lang}>
            <div className="min-h-screen px-8">
                <div className="max-w-7xl mx-auto py-16">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-28 mb-20">
                        <div className="space-y-8">
                            <div className="space-y-6">
                                <div className="text-[#e8563f] text-sm font-medium tracking-[0.3em] uppercase">
                                    {dict.about.sections.who.subtitle}
                                </div>
                                <h2 className="text-[#444444] text-5xl font-bold leading-tight">
                                    {dict.about.sections.who.title}
                                </h2>
                                <p className="text-[#6c6c6c] text-base leading-relaxed">
                                    {dict.about.sections.who.description}
                                </p>
                            </div>
                            <div className="mt-8">
                                <Image
                                    src={whoImage}
                                    alt="Al Wathba landscape representing our community roots"
                                    width={500}
                                    height={400}
                                    className="w-full h-auto rounded-lg object-cover"
                                />
                            </div>
                        </div>

                        <div className="space-y-8 mt-24">
                            <div className="space-y-6">
                                <div className="text-[#e8563f] text-sm font-medium tracking-[0.3em] uppercase">
                                    {dict.about.sections.why.subtitle}
                                </div>
                                <h2 className="text-[#444444] text-5xl font-bold leading-tight">
                                    {dict.about.sections.why.title}
                                </h2>
                                <p className="text-[#6c6c6c] text-base leading-relaxed">
                                    {dict.about.sections.why.description}
                                </p>
                            </div>
                            <div className="mt-8">
                                <Image
                                    src={whyImage}
                                    alt="Community cooperation and teamwork"
                                    width={500}
                                    height={400}
                                    className="w-full h-auto rounded-lg object-cover"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-[#f8f9fa] rounded-3xl p-12">
                        <div className="max-w-4xl mx-auto text-center space-y-8">
                            <div className="space-y-6">
                                <div className="text-[#e8563f] text-sm font-medium tracking-[0.3em] uppercase">
                                    {dict.about.sections.mission.subtitle}
                                </div>
                                <h2 className="text-[#444444] text-5xl font-bold leading-tight">
                                    {dict.about.sections.mission.title}
                                </h2>
                                <p className="text-[#6c6c6c] text-lg leading-relaxed max-w-3xl mx-auto">
                                    {dict.about.sections.mission.description}
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
                                <div className="space-y-4">
                                    <div className="w-16 h-16 bg-[#e8563f] rounded-full flex items-center justify-center mx-auto">
                                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-[#444444] text-xl font-semibold">
                                        {dict.about.goals[0].title}
                                    </h3>
                                    <p className="text-[#6c6c6c] text-sm">
                                        {dict.about.goals[0].description}
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    <div className="w-16 h-16 bg-[#e8563f] rounded-full flex items-center justify-center mx-auto">
                                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-[#444444] text-xl font-semibold">
                                        {dict.about.goals[1].title}
                                    </h3>
                                    <p className="text-[#6c6c6c] text-sm">
                                        {dict.about.goals[1].description}
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    <div className="w-16 h-16 bg-[#e8563f] rounded-full flex items-center justify-center mx-auto">
                                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                d="M13 10V3L4 14h7v7l9-11h-7z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-[#444444] text-xl font-semibold">
                                        {dict.about.goals[2].title}
                                    </h3>
                                    <p className="text-[#6c6c6c] text-sm">
                                        {dict.about.goals[2].description}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Board of Directors Section */}
                    <div className="mt-20">
                        <div className="text-center space-y-8 mb-16">
                            <div className="text-[#e8563f] text-sm font-medium tracking-[0.3em] uppercase">
                                {dict.about.boardOfDirectors.subtitle}
                            </div>
                            <h2 className="text-[#444444] text-5xl font-bold leading-tight">
                                {dict.about.boardOfDirectors.title}
                            </h2>
                            <p className="text-[#6c6c6c] text-lg leading-relaxed max-w-3xl mx-auto">
                                {dict.about.boardOfDirectors.description}
                            </p>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
                            {dict.about.boardOfDirectors.members.map((member, index) => (
                                <div key={index} className="text-center space-y-4">
                                    <div className="relative">
                                        <OptimizedImage
                                            src={`/assets/${member.image}`}
                                            alt={member.name}
                                            width={200}
                                            height={200}
                                            className="w-full h-48 object-cover rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300"
                                            transformation={[
                                                { width: 400, height: 400, crop: 'at_max', quality: 85 }
                                            ]}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className={`font-semibold text-lg text-[#444444] ${lang === 'ar' ? 'font-arabic' : ''}`}>
                                            {member.name}
                                        </h3>
                                        <p className={`text-[#e8563f] text-sm font-medium ${lang === 'ar' ? 'font-arabic' : ''}`}>
                                            {member.position}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </PublicLayoutWithTranslations>
    );
}