'use client';

import { useAuth } from '@/context/AuthContext';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import TiptapEditor from '@/app/(dashboard)/components/TiptapEditor';
import {
    CalendarIcon,
    BriefcaseIcon,
    BuildingOfficeIcon,
    MapPinIcon,
    CurrencyDollarIcon,
    ClockIcon,
    ArrowLeftIcon,
    GlobeAltIcon,
    EyeIcon,
    DocumentDuplicateIcon,
    CheckCircleIcon,
} from '@heroicons/react/24/outline';

export default function CreateJobPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [saving, setSaving] = useState(false);
    const [preview, setPreview] = useState(false);
    const [companies, setCompanies] = useState([]);
    const [formData, setFormData] = useState({
        title: '',
        institution: '',
        featuredImage: '',
        category: '',
        subCategory: '',
        content: '',
        jobType: 'full-time',
        postType: 'job',
        createdBy: '',
        status: 'draft',
        isVerified: false,
        views: 0,
        salary: {
            min: '',
            max: '',
            currency: 'USD',
            period: 'year'
        },
        location: {
            type: 'onsite',
            city: '',
            country: '',
            remote: false
        },
        requirements: [],
        benefits: [],
        applicationDeadline: '',
        experience: {
            min: '',
            max: '',
            level: 'entry'
        }
    });

    const [requirementInput, setRequirementInput] = useState('');
    const [benefitInput, setBenefitInput] = useState('');
    const [errors, setErrors] = useState({});

    const jobTypes = [
        { value: 'full-time', label: 'Full Time' },
        { value: 'part-time', label: 'Part Time' },
        { value: 'contract', label: 'Contract' },
        { value: 'freelance', label: 'Freelance' },
        { value: 'internship', label: 'Internship' },
        { value: 'temporary', label: 'Temporary' }
    ];

    const experienceLevels = [
        { value: 'entry', label: 'Entry Level' },
        { value: 'mid', label: 'Mid Level' },
        { value: 'senior', label: 'Senior Level' },
        { value: 'lead', label: 'Lead / Manager' },
        { value: 'executive', label: 'Executive' }
    ];

    const locationTypes = [
        { value: 'onsite', label: 'On-site' },
        { value: 'hybrid', label: 'Hybrid' },
        { value: 'remote', label: 'Remote' }
    ];

    const currencies = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY'];

    // Fetch companies on mount
    useEffect(() => {
        fetchCompanies();
        setFormData(prev => ({ ...prev, createdBy: user?.uid }));
    }, [user]);

    const fetchCompanies = async () => {
        try {
            const response = await fetch('/api/companies');
            if (response.ok) {
                const data = await response.json();
                setCompanies(data);
            }
        } catch (error) {
            console.error('Error fetching companies:', error);
        }
    };

    const handleAddRequirement = (e) => {
        if (e.key === 'Enter' && requirementInput.trim()) {
            e.preventDefault();
            setFormData({
                ...formData,
                requirements: [...formData.requirements, requirementInput.trim()]
            });
            setRequirementInput('');
        }
    };

    const handleRemoveRequirement = (reqToRemove) => {
        setFormData({
            ...formData,
            requirements: formData.requirements.filter(req => req !== reqToRemove)
        });
    };

    const handleAddBenefit = (e) => {
        if (e.key === 'Enter' && benefitInput.trim()) {
            e.preventDefault();
            setFormData({
                ...formData,
                benefits: [...formData.benefits, benefitInput.trim()]
            });
            setBenefitInput('');
        }
    };

    const handleRemoveBenefit = (benefitToRemove) => {
        setFormData({
            ...formData,
            benefits: formData.benefits.filter(benefit => benefit !== benefitToRemove)
        });
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.title.trim()) {
            newErrors.title = 'Job title is required';
        }

        if (!formData.institution) {
            newErrors.institution = 'Company/Institution is required';
        }

        if (!formData.category) {
            newErrors.category = 'Category is required';
        }

        if (!formData.content || formData.content.length < 100) {
            newErrors.content = 'Job description should be at least 100 characters';
        }

        if (formData.location.type !== 'remote') {
            if (!formData.location.city) {
                newErrors.city = 'City is required';
            }

            if (!formData.location.country) {
                newErrors.country = 'Country is required';
            }
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
            const jobData = {
                ...formData,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                datePosted: formData.status === 'published' ? new Date().toISOString() : null
            };

            const response = await fetch('/api/jobs/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(jobData),
            });

            if (response.ok) {
                router.push('/editorial-dashboard');
            } else {
                const data = await response.json();
                alert(data.error || 'Failed to create job');
            }
        } catch (error) {
            console.error('Error creating job:', error);
            alert('Failed to create job');
        } finally {
            setSaving(false);
        }
    };

    const handleSaveDraft = async () => {
        setFormData({ ...formData, status: 'draft' });
        await handleSubmit(new Event('submit'));
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.back()}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <ArrowLeftIcon className="h-5 w-5 text-gray-600" />
                    </button>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Create New Job</h1>
                        <p className="text-sm text-gray-500 mt-1">Post a job opportunity</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button
                        type="button"
                        onClick={() => setPreview(!preview)}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium flex items-center gap-2"
                    >
                        <EyeIcon className="h-4 w-4" />
                        {preview ? 'Edit' : 'Preview'}
                    </button>
                    <button
                        onClick={handleSaveDraft}
                        disabled={saving}
                        className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium flex items-center gap-2 disabled:opacity-50"
                    >
                        <DocumentDuplicateIcon className="h-4 w-4" />
                        Save Draft
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={saving}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2 disabled:opacity-50"
                    >
                        <GlobeAltIcon className="h-4 w-4" />
                        Publish
                    </button>
                </div>
            </div>

            {preview ? (
                // Preview Mode
                <div className="bg-white rounded-xl shadow-lg p-8">
                    <h1 className="text-3xl font-bold mb-2">{formData.title}</h1>
                    <p className="text-gray-600 mb-4">{companies.find(c => c.id === formData.institution)?.name}</p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <div className="p-3 bg-gray-50 rounded-lg">
                            <p className="text-xs text-gray-500">Job Type</p>
                            <p className="font-medium">{jobTypes.find(j => j.value === formData.jobType)?.label}</p>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg">
                            <p className="text-xs text-gray-500">Location</p>
                            <p className="font-medium">
                                {formData.location.type === 'remote'
                                    ? 'Remote'
                                    : `${formData.location.city}, ${formData.location.country}`}
                            </p>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg">
                            <p className="text-xs text-gray-500">Experience</p>
                            <p className="font-medium">{experienceLevels.find(e => e.value === formData.experience.level)?.label}</p>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg">
                            <p className="text-xs text-gray-500">Salary</p>
                            <p className="font-medium">
                                {formData.salary.min && formData.salary.max
                                    ? `${formData.salary.currency} ${formData.salary.min} - ${formData.salary.max} / ${formData.salary.period}`
                                    : 'Not specified'}
                            </p>
                        </div>
                    </div>

                    <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: formData.content }} />
                </div>
            ) : (
                // Edit Mode
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Job Title */}
                            <div className="bg-white rounded-xl shadow-lg p-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Job Title <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className={`w-full px-4 py-3 text-lg border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.title ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                    placeholder="e.g. Senior Frontend Developer"
                                />
                                {errors.title && (
                                    <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                                )}
                            </div>

                            {/* Company/Institution */}
                            <div className="bg-white rounded-xl shadow-lg p-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Company / Institution <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={formData.institution}
                                    onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.institution ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                >
                                    <option value="">Select a company</option>
                                    {companies.map((company) => (
                                        <option key={company.id} value={company.id}>
                                            {company.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.institution && (
                                    <p className="mt-1 text-sm text-red-600">{errors.institution}</p>
                                )}
                            </div>

                            {/* Job Description */}
                            <div className="bg-white rounded-xl shadow-lg p-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Job Description <span className="text-red-500">*</span>
                                </label>
                                <TiptapEditor
                                    content={formData.content}
                                    onChange={(content) => setFormData({ ...formData, content })}
                                    placeholder="Describe the job role, responsibilities, and requirements..."
                                />
                                {errors.content && (
                                    <p className="mt-2 text-sm text-red-600">{errors.content}</p>
                                )}
                            </div>

                            {/* Requirements */}
                            <div className="bg-white rounded-xl shadow-lg p-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Requirements
                                </label>
                                <input
                                    type="text"
                                    value={requirementInput}
                                    onChange={(e) => setRequirementInput(e.target.value)}
                                    onKeyDown={handleAddRequirement}
                                    placeholder="Type and press Enter to add requirements"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 mb-3"
                                />
                                <div className="space-y-2">
                                    {formData.requirements.map((req, index) => (
                                        <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                                            <span className="text-sm">{req}</span>
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveRequirement(req)}
                                                className="text-red-600 hover:text-red-800"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Benefits */}
                            <div className="bg-white rounded-xl shadow-lg p-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Benefits
                                </label>
                                <input
                                    type="text"
                                    value={benefitInput}
                                    onChange={(e) => setBenefitInput(e.target.value)}
                                    onKeyDown={handleAddBenefit}
                                    placeholder="Type and press Enter to add benefits"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 mb-3"
                                />
                                <div className="space-y-2">
                                    {formData.benefits.map((benefit, index) => (
                                        <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                                            <span className="text-sm">{benefit}</span>
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveBenefit(benefit)}
                                                className="text-red-600 hover:text-red-800"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Job Details */}
                            <div className="bg-white rounded-xl shadow-lg p-6">
                                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                    <BriefcaseIcon className="h-5 w-5 text-gray-500" />
                                    Job Details
                                </h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Category <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            value={formData.category}
                                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.category ? 'border-red-500' : 'border-gray-300'
                                                }`}
                                        >
                                            <option value="">Select category</option>
                                            <option value="technology">Technology</option>
                                            <option value="design">Design</option>
                                            <option value="marketing">Marketing</option>
                                            <option value="sales">Sales</option>
                                            <option value="customer-service">Customer Service</option>
                                            <option value="hr">Human Resources</option>
                                            <option value="finance">Finance</option>
                                            <option value="healthcare">Healthcare</option>
                                            <option value="education">Education</option>
                                            <option value="other">Other</option>
                                        </select>
                                        {errors.category && (
                                            <p className="mt-1 text-sm text-red-600">{errors.category}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Sub Category
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.subCategory}
                                            onChange={(e) => setFormData({ ...formData, subCategory: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                            placeholder="e.g. Frontend, Backend"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Job Type
                                        </label>
                                        <select
                                            value={formData.jobType}
                                            onChange={(e) => setFormData({ ...formData, jobType: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        >
                                            {jobTypes.map((type) => (
                                                <option key={type.value} value={type.value}>
                                                    {type.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Experience Level
                                        </label>
                                        <select
                                            value={formData.experience.level}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                experience: { ...formData.experience, level: e.target.value }
                                            })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        >
                                            {experienceLevels.map((level) => (
                                                <option key={level.value} value={level.value}>
                                                    {level.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Min Years
                                            </label>
                                            <input
                                                type="number"
                                                min="0"
                                                value={formData.experience.min}
                                                onChange={(e) => setFormData({
                                                    ...formData,
                                                    experience: { ...formData.experience, min: e.target.value }
                                                })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                                placeholder="0"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Max Years
                                            </label>
                                            <input
                                                type="number"
                                                min="0"
                                                value={formData.experience.max}
                                                onChange={(e) => setFormData({
                                                    ...formData,
                                                    experience: { ...formData.experience, max: e.target.value }
                                                })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                                placeholder="10"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Location */}
                            <div className="bg-white rounded-xl shadow-lg p-6">
                                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                    <MapPinIcon className="h-5 w-5 text-gray-500" />
                                    Location
                                </h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Location Type
                                        </label>
                                        <select
                                            value={formData.location.type}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                location: { ...formData.location, type: e.target.value, remote: e.target.value === 'remote' }
                                            })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        >
                                            {locationTypes.map((type) => (
                                                <option key={type.value} value={type.value}>
                                                    {type.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {formData.location.type !== 'remote' && (
                                        <>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    City <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    value={formData.location.city}
                                                    onChange={(e) => setFormData({
                                                        ...formData,
                                                        location: { ...formData.location, city: e.target.value }
                                                    })}
                                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.city ? 'border-red-500' : 'border-gray-300'
                                                        }`}
                                                    placeholder="e.g. New York"
                                                />
                                                {errors.city && (
                                                    <p className="mt-1 text-sm text-red-600">{errors.city}</p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Country <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    value={formData.location.country}
                                                    onChange={(e) => setFormData({
                                                        ...formData,
                                                        location: { ...formData.location, country: e.target.value }
                                                    })}
                                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.country ? 'border-red-500' : 'border-gray-300'
                                                        }`}
                                                    placeholder="e.g. USA"
                                                />
                                                {errors.country && (
                                                    <p className="mt-1 text-sm text-red-600">{errors.country}</p>
                                                )}
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Salary */}
                            <div className="bg-white rounded-xl shadow-lg p-6">
                                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                    <CurrencyDollarIcon className="h-5 w-5 text-gray-500" />
                                    Salary
                                </h3>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Currency
                                            </label>
                                            <select
                                                value={formData.salary.currency}
                                                onChange={(e) => setFormData({
                                                    ...formData,
                                                    salary: { ...formData.salary, currency: e.target.value }
                                                })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                            >
                                                {currencies.map((currency) => (
                                                    <option key={currency} value={currency}>
                                                        {currency}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Period
                                            </label>
                                            <select
                                                value={formData.salary.period}
                                                onChange={(e) => setFormData({
                                                    ...formData,
                                                    salary: { ...formData.salary, period: e.target.value }
                                                })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                            >
                                                <option value="hour">Per Hour</option>
                                                <option value="day">Per Day</option>
                                                <option value="week">Per Week</option>
                                                <option value="month">Per Month</option>
                                                <option value="year">Per Year</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Minimum
                                            </label>
                                            <input
                                                type="number"
                                                min="0"
                                                value={formData.salary.min}
                                                onChange={(e) => setFormData({
                                                    ...formData,
                                                    salary: { ...formData.salary, min: e.target.value }
                                                })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                                placeholder="50000"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Maximum
                                            </label>
                                            <input
                                                type="number"
                                                min="0"
                                                value={formData.salary.max}
                                                onChange={(e) => setFormData({
                                                    ...formData,
                                                    salary: { ...formData.salary, max: e.target.value }
                                                })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                                placeholder="80000"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Application Details */}
                            <div className="bg-white rounded-xl shadow-lg p-6">
                                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                    <ClockIcon className="h-5 w-5 text-gray-500" />
                                    Application Details
                                </h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Application Deadline
                                        </label>
                                        <input
                                            type="date"
                                            value={formData.applicationDeadline}
                                            onChange={(e) => setFormData({ ...formData, applicationDeadline: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Status
                                        </label>
                                        <select
                                            value={formData.status}
                                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="draft">Draft</option>
                                            <option value="published">Published</option>
                                        </select>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            id="isVerified"
                                            checked={formData.isVerified}
                                            onChange={(e) => setFormData({ ...formData, isVerified: e.target.checked })}
                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        <label htmlFor="isVerified" className="text-sm text-gray-700">
                                            Verified Job
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {/* Featured Image */}
                            <div className="bg-white rounded-xl shadow-lg p-6">
                                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                    <BuildingOfficeIcon className="h-5 w-5 text-gray-500" />
                                    Featured Image
                                </h3>
                                <input
                                    type="url"
                                    value={formData.featuredImage}
                                    onChange={(e) => setFormData({ ...formData, featuredImage: e.target.value })}
                                    placeholder="https://example.com/company-logo.jpg"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                                {formData.featuredImage && (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                        src={formData.featuredImage}
                                        alt="Company"
                                        className="mt-3 w-full h-32 object-cover rounded-lg"
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                </form>
            )}
        </div>
    );
}