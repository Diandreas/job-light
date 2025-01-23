import React, { useState } from 'react';
import { Info, Gift, BookOpen, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/Components/ui/accordion';

const InfoSection = ({ icon: Icon, title, children }) => (
    <Card className="mb-6 bg-white hover:shadow-lg transition-shadow duration-300">
        <CardHeader className="flex flex-row items-center space-x-2">
            <Icon className="h-6 w-6 text-indigo-600" />
            <CardTitle className="text-xl font-semibold text-indigo-700">{title}</CardTitle>
        </CardHeader>
        <CardContent>{children}</CardContent>
    </Card>
);

const Infos = () => {
    const [openSection, setOpenSection] = useState('');

    const toggleSection = (section) => {
        setOpenSection(openSection === section ? '' : section);
    };

    return (
        <div className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg shadow-lg">
            <h2 className="text-3xl font-bold text-center mb-8 text-indigo-800">Sponsorship Program Information</h2>

            <InfoSection icon={Info} title="How It Works">
                <p className="text-gray-700 mb-4">Our sponsorship program is designed to reward our loyal customers for spreading the word about our products/services. Here's how it works:</p>
                <ol className="list-decimal list-inside space-y-2 text-gray-700">
                    <li>Sign up for an account on our platform</li>
                    <li>Receive a unique referral link</li>
                    <li>Share your link with friends, family, or on social media</li>
                    <li>Earn rewards when people sign up or make purchases using your link</li>
                    <li>Track your progress and earnings on your personalized dashboard</li>
                </ol>
            </InfoSection>

            <InfoSection icon={Gift} title="Benefits for Sponsors">
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                    <li>Earn up to 10% commission on referred purchases</li>
                    <li>Receive exclusive discounts on our products/services</li>
                    <li>Gain access to special promotions and early product releases</li>
                    <li>Unlock higher reward tiers as you refer more people</li>
                    <li>Potential for monthly bonuses for top performers</li>
                </ul>
            </InfoSection>

            <InfoSection icon={BookOpen} title="Rules and Regulations">
                <Accordion type="single" collapsible>
                    <AccordionItem value="item-1">
                        <AccordionTrigger>Eligibility</AccordionTrigger>
                        <AccordionContent>
                            Must be 18 years or older and a registered user of our platform.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2">
                        <AccordionTrigger>Referral Validity</AccordionTrigger>
                        <AccordionContent>
                            Referrals are valid for 30 days from the initial click on your unique link.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-3">
                        <AccordionTrigger>Payment Terms</AccordionTrigger>
                        <AccordionContent>
                            Earnings are paid out monthly, with a minimum payout threshold of 5000 FCFA.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-4">
                        <AccordionTrigger>Prohibited Activities</AccordionTrigger>
                        <AccordionContent>
                            Spamming, using misleading information, or creating fake accounts is strictly prohibited.
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </InfoSection>

            <InfoSection icon={HelpCircle} title="FAQ">
                <Accordion type="single" collapsible>
                    <AccordionItem value="item-1">
                        <AccordionTrigger>How do I start referring people?</AccordionTrigger>
                        <AccordionContent>
                            After signing up, you'll receive a unique referral link in your dashboard. Share this link with potential customers.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2">
                        <AccordionTrigger>When do I get paid?</AccordionTrigger>
                        <AccordionContent>
                            Payments are processed on the 1st of each month for the previous month's earnings, provided you've reached the minimum payout threshold.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-3">
                        <AccordionTrigger>Can I refer myself?</AccordionTrigger>
                        <AccordionContent>
                            No, self-referrals are not allowed and may result in account suspension.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-4">
                        <AccordionTrigger>How are commissions calculated?</AccordionTrigger>
                        <AccordionContent>
                            Commissions are calculated as a percentage of the net purchase amount (excluding taxes and shipping) made by your referrals.
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </InfoSection>
        </div>
    );
};

export default Infos;
