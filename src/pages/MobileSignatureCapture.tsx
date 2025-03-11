import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { SignatureCanvas } from '../components/SignatureCanvas';
import { supabase } from '../lib/supabase';
import { Logo } from '../components/Logo';

export const MobileSignatureCapture: React.FC = () => {
  const { templateId } = useParams<{ templateId: string }>();
  const [signature, setSignature] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    if (!signature) {
      setError('Please provide a signature.');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      // Fetch template to get fields
      const { data: template, error: templateError } = await supabase
        .from('templates')
        .select('fields')
        .eq('id', templateId)
        .single();

      if (templateError) throw templateError;
      if (!template) throw new Error('Template not found');

      // Find the signature field
      const signatureField = template.fields.find((field: any) => field.type === 'signature');
      if (!signatureField) {
        throw new Error('Signature field not found in template');
      }

      // Prepare form values with the signature
      const formValues = {
        [signatureField.label]: signature,
      };

      // Insert into signed_documents
      const { error: insertError } = await supabase  // Await the insert operation
        .from('signed_documents')
        .insert([
          {
            template_id: templateId,
            form_values: formValues,
            user_id: null, // Or a temporary/anonymous user ID
          },
        ]);

      if (insertError) throw insertError;

      setSaved(true);
    } catch (err: any) {
      console.error('Error saving signature:', err);
      setError(err.message || 'Failed to save signature.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Logo className="h-10 w-auto" />
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-8">
            {saved ? (
              <div className="text-center">
                <h2 className="text-2xl font-bold text-green-700 mb-4">Signature Saved!</h2>
                <p className="text-gray-600">
                  You can now return to your computer to continue.
                </p>
              </div>
            ) : (
              <>
                <h1 className="text-2xl font-bold text-gray-900 mb-4 text-center">
                  Sign Document
                </h1>
                {error && (
                  <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}
                <SignatureCanvas onSave={setSignature} width={300} height={200} />
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="mt-6 w-full flex items-center justify-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : 'Save Signature'}
                </button>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};
