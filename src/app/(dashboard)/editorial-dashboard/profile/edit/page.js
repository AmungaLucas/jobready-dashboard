'use client';

import { useAuth } from '@/context/AuthContext';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircleIcon } from '@heroicons/react/24/outline';

export default function EditProfilePage() {
    const { user } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        bio: '',
        socials: {
            twitter: '',
            instagram: '',
            website: ''
        }
    });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (user?.uid) {
            fetchProfile();
        }
    }, [user]);

    const fetchProfile = async () => {
        try {
            const response = await fetch(`/api/editor/profile?userId=${user.uid}`);
            if (response.ok) {
                const data = await response.json();
                setFormData({
                    name: data.name || user?.name || '',
                    bio: data.bio || '',
                    socials: {
                        twitter: data.socials?.twitter || '',
                        instagram: data.socials?.instagram || '',
                        website: data.socials?.website || ''
                    }
                });
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Name is required';
        }

        if (!formData.bio.trim()) {
            newErrors.bio = 'Bio is required';
        } else if (formData.bio.length < 50) {
            newErrors.bio = `Bio should be at least 50 characters (currently ${formData.bio.length})`;
        }

        if (!formData.socials.twitter && !formData.socials.instagram && !formData.socials.website) {
            newErrors.socials = 'At least one social link is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setSaving(true);
        try {
            const response = await fetch('/api/editor/profile/update', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: user.uid,
                    ...formData
                }),
            });

            if (response.ok) {
                setShowSuccess(true);
                setTimeout(() => {
                    router.push('/editorial-dashboard');
                }, 2000);
            } else {
                const data = await response.json();
                alert(data.error || 'Failed to update profile');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-green-500"></div>
            </div>
        );
    }

    if (showSuccess) {
        return (
            <div className="max-w-3xl mx-auto py-8 px-4">
                <div className="bg-white rounded-xl shadow-lg p-8 md:p-12 text-center">
                    <div className="flex justify-center mb-4">
                        <CheckCircleIcon className="h-16 w-16 text-green-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Profile Updated Successfully!</h2>
                    <p className="text-gray-600 mb-4">
                        Your editor profile is now complete. Redirecting to dashboard...
                    </p>
                    <div className="w-16 h-1 bg-green-500 mx-auto animate-pulse"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto py-8 px-4">
            <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Complete Your Editor Profile</h1>
                    <p className="text-gray-600">
                        Please provide your details to activate your editor account.
                        <span className="text-red-500">*</span> All fields are required.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Display Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${errors.name ? 'border-red-500' : 'border-gray-300'
                                }`}
                            placeholder="Your public display name"
                        />
                        {errors.name && (
                            <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                        )}
                    </div>

                    {/* Bio */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Bio <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            value={formData.bio}
                            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                            rows="5"
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${errors.bio ? 'border-red-500' : 'border-gray-300'
                                }`}
                            placeholder="Tell us about yourself, your expertise, and what you'll be writing about..."
                        />
                        <div className="flex justify-between mt-1">
                            <p className={`text-xs ${formData.bio.length >= 50 ? 'text-green-600' : 'text-gray-500'}`}>
                                {formData.bio.length} / 50 characters
                            </p>
                            {errors.bio && (
                                <p className="text-sm text-red-600">{errors.bio}</p>
                            )}
                        </div>
                    </div>

                    {/* Social Links */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Social Links <span className="text-red-500">*</span>
                            </label>
                            <p className="text-xs text-gray-500 mb-3">At least one social link is required</p>
                        </div>

                        {errors.socials && (
                            <p className="text-sm text-red-600 bg-red-50 p-2 rounded">{errors.socials}</p>
                        )}

                        <div>
                            <div className="flex items-center gap-2">
                                <span className="text-gray-500 w-20 text-sm">Twitter</span>
                                <input
                                    type="url"
                                    value={formData.socials.twitter}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        socials: { ...formData.socials, twitter: e.target.value }
                                    })}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                                    placeholder="https://twitter.com/username"
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center gap-2">
                                <span className="text-gray-500 w-20 text-sm">Instagram</span>
                                <input
                                    type="url"
                                    value={formData.socials.instagram}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        socials: { ...formData.socials, instagram: e.target.value }
                                    })}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                                    placeholder="https://instagram.com/username"
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center gap-2">
                                <span className="text-gray-500 w-20 text-sm">Website</span>
                                <input
                                    type="url"
                                    value={formData.socials.website}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        socials: { ...formData.socials, website: e.target.value }
                                    })}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                                    placeholder="https://yourwebsite.com"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex flex-col sm:flex-row gap-4 pt-4">
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex-1 px-6 py-3 bg-linear-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md"
                        >
                            {saving ? (
                                <span className="flex items-center justify-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Saving...
                                </span>
                            ) : 'Complete Profile'}
                        </button>
                        <button
                            type="button"
                            onClick={() => router.push('/editorial-dashboard')}
                            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                        >
                            Later
                        </button>
                    </div>
                </form>

                {/* Progress Indicator */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Profile Completion Progress</h4>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                            <span className={formData.name ? 'text-green-600' : 'text-gray-500'}>
                                ✓ Name provided
                            </span>
                            {formData.name && <CheckCircleIcon className="h-4 w-4 text-green-500" />}
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className={formData.bio.length >= 50 ? 'text-green-600' : 'text-gray-500'}>
                                ✓ Bio completed ({formData.bio.length}/50)
                            </span>
                            {formData.bio.length >= 50 && <CheckCircleIcon className="h-4 w-4 text-green-500" />}
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className={(formData.socials.twitter || formData.socials.instagram || formData.socials.website) ? 'text-green-600' : 'text-gray-500'}>
                                ✓ Social links added
                            </span>
                            {(formData.socials.twitter || formData.socials.instagram || formData.socials.website) &&
                                <CheckCircleIcon className="h-4 w-4 text-green-500" />
                            }
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}