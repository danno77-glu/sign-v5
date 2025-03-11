.updatedDocument.form_values,
                    }));
                }

            }
        })
        .subscribe()

        return () => {
            supabase.removeChannel(channel);
        };
    }, [templateId]);


  if (!template || !pdfUrl) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        {error ? (
          <div className="text-center p-8">
            <div className="mb-4 text-red-600">{error}</div>
            <button
              onClick={loadTemplate}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        ) : (
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Logo className="h-10 w-auto" />
              <h1 className="text-xl font-semibold text-gray-900">Sign Document</h1>
            </div>
            <button
              onClick={() => navigate(`/sign/${templateId}`)}
              className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {(error || success) && (
          <div className={`p-4 rounded-lg mb-6 ${
            success
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {success ? 'Document signed successfully!' : error}
          </div>
        )}

        {success ? (
          <div className="text-center p-8">
            <h2 className="text-2xl font-bold text-green-700 mb-4">Thank You!</h2>
            <p className="text-gray-600 mb-6">Your document has been signed and submitted successfully.</p>
            {signedDocument && (
                <button
                onClick={() => downloadSignedPdf(signedDocument)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                <Download className="mr-2 h-4 w-4" />
                Download Signed Document
                </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-lg shadow-sm">
                  <PDFViewer                            
                    file={pdfUrl}
                    formFields={template.fields.map((field) => ({
                      ...field,
                      value: formValues[field.label] || "",
                    }))}
                    onSignaturePositionSelect={() => {}}
                    onFieldClick={handleFieldClick}
                    onPageChange={handlePageChange}
                    ref={pdfViewerRef}
                  />
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Required Fields</h3>
                  <div className="space-y-4">
                    {template.fields.map((field, index) => (
                      <div key={index} className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          {field.label}
                          {field.required && <span className="text-red-500 ml-1">*</span>}
                        </label>
                        {field.type === 'signature' ? (
                          <>
                            {/* Show options only when the field is active */}
                            {activeField === field.label && !showSignaturePad && !showQRCode && (
                                <div className="flex space-x-2">
                                <button
                                    onClick={() => setShowSignaturePad(true)}
                                    className="flex-1 px-4 py-2 text-sm font-medium border rounded-md text-blue-700 border-blue-300 bg-white hover:bg-blue-50"
                                >
                                    <Pen className="w-4 h-4 mr-1" />
                                    Draw Signature
                                </button>
                                {!isMobile && (
                                  <button
                                      onClick={() => setShowQRCode(true)}
                                      className="flex-1 px-4 py-2 text-sm font-medium border rounded-md text-blue-700 border-blue-300 bg-white hover:bg-blue-50"
                                  >
                                      <Smartphone className="w-4 h-4 mr-1" />
                                      Sign on Mobile (QR Code)
                                  </button>
                                )}
                                </div>
                            )}

                            {/* Show signature preview if available */}
                            {formValues[field.label] && (
                              <img
                                src={formValues[field.label]}
                                alt="Signature"
                                className="mt-1 max-h-12 object-contain"
                              />
                            )}
                          </>
                        ) : field.type === 'date' ? (
                          <input
                            type="date"
                            value={formValues[field.label] || ''}
                            onChange={(e) => handleInputChange(field, e.target.value)}
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          />
                        ) : (
                          <input
                            type="text"
                            value={formValues[field.label] || ''}
                            onChange={(e) => handleInputChange(field, e.target.value)}
                            placeholder={`Enter ${field.label.toLowerCase()}`}
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          />
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 pt-6 border-t border-gray-200">
                    {template && currentFieldIndex < template.fields.length -1 ? (
                        <button
                            onClick={handleNextField}
                            disabled={!formValues[template.fields[currentFieldIndex].label]}
                            className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
                        >
                            Next Field
                            <ArrowRightCircle className="w-4 h-4 ml-2" />
                        </button>
                    ) : (
                        <button
                        onClick={handleSave}
                        disabled={isSaving || success}
                        className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
                        >
                        <Save className="w-4 h-4 mr-2" />
                        {isSaving ? 'Saving...' : 'Submit Document'}
                        </button>
                    )}
                    </div>
                </div>
              </div>
            </div>

            {/* QR Code Modal */}
            {showQRCode && activeField && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-lg p-6 max-w-sm w-full shadow-xl">
                  <h4 className="text-center text-gray-700 mb-4">Scan to Sign</h4>
                  <div className="flex justify-center">
                    <QRCode value={`${window.location.origin}/sign/${templateId}/mobile-signature`} size={192} level="H" />
                  </div>
                  <button
                    onClick={() => {
                      setShowQRCode(false);
                      setShowSignaturePad(false);
                    }}
                    className="mt-4 w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
            {/* Signature Pad Modal (Mobile Only) */}
            {showSignaturePad && activeField && isMobile && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-lg p-6 max-w-2xl w-full shadow-xl">
                  <SignatureCanvas onSave={handleSignatureSave} onCancel={handleCancelSignature} />
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
