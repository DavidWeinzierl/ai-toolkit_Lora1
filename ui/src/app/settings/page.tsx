'use client';

import { useEffect, useState } from 'react';

export default function Settings() {
  const [settings, setSettings] = useState({
    HF_TOKEN: '',
    TRAINING_FOLDER: '',
    DATASETS_FOLDER: '',
  });
  const [status, setStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');

  useEffect(() => {
    // Fetch current settings
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        setSettings({
          HF_TOKEN: data.HF_TOKEN || '',
          TRAINING_FOLDER: data.TRAINING_FOLDER || '',
          DATASETS_FOLDER: data.DATASETS_FOLDER || '',
        });
      })
      .catch(error => console.error('Error fetching settings:', error));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('saving');

    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      if (!response.ok) throw new Error('Failed to save settings');

      setStatus('success');
      setTimeout(() => setStatus('idle'), 2000);
    } catch (error) {
      console.error('Error saving settings:', error);
      setStatus('error');
      setTimeout(() => setStatus('idle'), 2000);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold mb-8">Settings</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div>
            <label htmlFor="HF_TOKEN" className="block text-sm font-medium mb-2">
              Hugging Face Token
              <div className="text-gray-500 text-sm ml-1">
                Create a Read token on{' '}
                <a href="https://huggingface.co/settings/tokens" target="_blank" rel="noreferrer">
                  {' '}
                  Huggingface
                </a>{' '}
                if you need to access gated/private models.
              </div>
            </label>
            <input
              type="password"
              id="HF_TOKEN"
              name="HF_TOKEN"
              value={settings.HF_TOKEN}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-gray-600 focus:border-transparent"
              placeholder="Enter your Hugging Face token"
            />
          </div>

          <div>
            <label htmlFor="TRAINING_FOLDER" className="block text-sm font-medium mb-2">
              Training Folder Path
              <div className="text-gray-500 text-sm ml-1">
                We will store your training information here. Must be an absolute path. If blank, it will default to the
                output folder in the project root.
              </div>
            </label>
            <input
              type="text"
              id="TRAINING_FOLDER"
              name="TRAINING_FOLDER"
              value={settings.TRAINING_FOLDER}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-gray-600 focus:border-transparent"
              placeholder="Enter training folder path"
            />
          </div>

          <div>
            <label htmlFor="DATASETS_FOLDER" className="block text-sm font-medium mb-2">
              Dataset Folder Path
              <div className="text-gray-500 text-sm ml-1">
                Where we store and find your datasets.{' '}
                <span className="text-orange-800">
                  Warning: This software may modify datasets so it is recommended you keep a backup somewhere else or
                  have a dedicated folder for this software.
                </span>
              </div>
            </label>
            <input
              type="text"
              id="DATASETS_FOLDER"
              name="DATASETS_FOLDER"
              value={settings.DATASETS_FOLDER}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-gray-600 focus:border-transparent"
              placeholder="Enter datasets folder path"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={status === 'saving'}
          className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {status === 'saving' ? 'Saving...' : 'Save Settings'}
        </button>

        {status === 'success' && <p className="text-green-500 text-center">Settings saved successfully!</p>}
        {status === 'error' && <p className="text-red-500 text-center">Error saving settings. Please try again.</p>}
      </form>
    </div>
  );
}
