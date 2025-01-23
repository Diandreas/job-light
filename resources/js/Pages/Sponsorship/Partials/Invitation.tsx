import React, { useState } from 'react';
import axios from 'axios';
import { Share2, Copy, Check } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Alert, AlertDescription } from '@/Components/ui/alert';

const Invitation = ({ referralCode }) => {
    const [invitationLink, setInvitationLink] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [copied, setCopied] = useState(false);

    const generateInvitation = async () => {
        setIsLoading(true);
        setError('');
        try {
            const response = await axios.post('/sponsorship/generate-invitation');
            setInvitationLink(`https://yourapp.com/register?ref=${response.data.invitationLink}`);
        } catch (error) {
            console.error('Error generating invitation link', error);
            setError('Failed to generate invitation link. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(invitationLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <Card className="w-full max-w-md mx-auto">
            <CardHeader>
                <CardTitle className="text-2xl font-bold text-center text-indigo-700">Invite Friends</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="bg-indigo-50 p-3 rounded-md">
                        <p className="text-sm text-indigo-700 font-medium">Your referral code:</p>
                        <p className="text-lg font-bold text-indigo-900">{referralCode}</p>
                    </div>

                    <Button
                        onClick={generateInvitation}
                        disabled={isLoading}
                        className="w-full bg-indigo-600 hover:bg-indigo-700"
                    >
                        {isLoading ? 'Generating...' : 'Generate Invitation Link'}
                        <Share2 className="ml-2 h-4 w-4" />
                    </Button>

                    {error && (
                        <Alert variant="destructive">
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    {invitationLink && (
                        <div className="mt-4 space-y-2">
                            <p className="text-sm font-medium text-gray-700">Share this link:</p>
                            <div className="flex">
                                <Input
                                    value={invitationLink}
                                    readOnly
                                    className="flex-grow"
                                />
                                <Button
                                    onClick={copyToClipboard}
                                    className="ml-2 bg-green-600 hover:bg-green-700"
                                >
                                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

export default Invitation;
