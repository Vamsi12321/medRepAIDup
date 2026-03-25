"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AdminNavbar from "@/components/admin/AdminNavbar";
import Breadcrumb from "@/components/Breadcrumb";

// Available field types for drug forms
const fieldTypes = [
  { id: "text", name: "Text Input", icon: "📝", description: "Single line text field" },
  { id: "textarea", name: "Text Area", icon: "📄", description: "Multi-line text field" },
  { id: "select", name: "Dropdown", icon: "📋", description: "Select from predefined options" },
  { id: "multiselect", name: "Multi-Select", icon: "☑️", description: "Select multiple options" },
  { id: "date", name: "Date Picker", icon: "📅", description: "Date selection field" },
  { id: "number", name: "Number", icon: "🔢", description: "Numeric input field" },
  { id: "file", name: "File Upload", icon: "📎", description: "File attachment field" },
  { id: "url", name: "URL", icon: "🔗", description: "Web link field" },
];

// Default drug fields that are always included
const defaultFields = [
  { id: "drug_name", name: "Drug Name", type: "text", required: true, locked: true },
  { id: "brand_name", name: "Brand Name", type: "text", required: true, locked: true },
  { id: "generic_name", name: "Generic Name", type: "text", required: false, locked: true },
  { id: "drug_class", name: "Drug Class", type: "text", required: false, locked: true },
  { id: "company_id", name: "Company ID", type: "text", required: true, locked: true },
  { id: "status", name: "Status", type: "select", required: true, locked: true, options: ["Active", "Inactive", "Pending"] },
];

// Mock data for company form configurations
const mockFormConfigs = {
  "company001": {
    companyName: "PharmaTech Solutions",
    fields: [
      ...defaultFields,
      { id: "specialization", name: "Specialization", type: "multiselect", required: true, options: ["cardiology", "diabetology", "neurology", "oncology"] },
      { id: "indications", name: "Indications", type: "textarea", required: true },
      { id: "dosage", name: "Dosage", type: "text", required: true },
      { id: "side_effects", name: "Side Effects", type: "textarea", required: false },
      { id: "contraindications", name: "Contraindications", type: "textarea", required: false },
      { id: "launch_date", name: "Launch Date", type: "date", required: true },
      { id: "brochure_url", name: "Brochure PDF", type: "file", required: false },
    ]
  },
  "company002": {
    companyName: "MediCorp Industries", 
    fields: [
      ...defaultFields,
      { id: "specialization", name: "Medical Specialty", type: "select", required: true, options: ["cardiology", "diabetology", "neurology"] },
      { id: "indications", name: "Treatment Indications", type: "textarea", required: true },
      { id: "mechanism_of_action", name: "Mechanism of Action", type: "textarea", required: true },
      { id: "dosage", name: "Recommended Dosage", type: "text", required: true },
      { id: "drug_interactions", name: "Drug Interactions", type: "textarea", required: false },
      { id: "launch_date", name: "Market Launch Date", type: "date", required: true },
    ]
  }
};

export default function AdminDrugForms() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedCompanyId = searchParams.get('company');
  
  const [companies] = useState([
    { id: "company001", name: "PharmaTech Solutions" },
    { id: "company002", name: "MediCorp Industries" },
    { id: "company003", name: "BioHealth Labs" },
  ]);
  
  const [selectedCompany, setSelectedCompany] = useState(selectedCompanyId || "company001");
  const [formConfig, setFormConfig] = useState(mockFormConfigs[selectedCompany] || { fields: [...defaultFields] });
  const [showFieldModal, setShowFieldModal] = useState(false);
  const [editingField, setEditingField] = useState(null);

  useEffect(() => {
    if (selectedCompanyId) {
      setSelectedCompany(selectedCompanyId);
    }
  }, [selectedCompanyId]);

  useEffect(() => {
    setFormConfig(mockFormConfigs[selectedCompany] || { 
      companyName: companies.find(c => c.id === selectedCompany)?.name || "Unknown Company",
      fields: [...defaultFields] 
    });
  }, [selectedCompany, companies]);

  const handleAddField = () => {
    setEditingField(null);
    setShowFieldModal(true);
  };

  const handleEditField = (field) => {
    setEditingField(field);
    setShowFieldModal(true);
  };

  const handleDeleteField = (fieldId) => {
    if (window.confirm("Are you sure you want to delete this field?")) {
      setFormConfig(prev => ({
        ...prev,
        fields: prev.fields.filter(f => f.id !== fieldId)
      }));
    }
  };

  const customFields = formConfig.fields.filter(f => !f.locked);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50 overflow-x-hidden">
      <AdminNavbar />
      
      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-8">
        <Breadcrumb />
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Dynamic Drug Forms 📝</h1>
            <p className="text-gray-600 text-sm sm:text-base">Customize drug input forms for each pharmaceutical company</p>
          </div>
          <button 
            onClick={handleAddField}
            className="w-full sm:w-auto bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-xl font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-2"
          >
            <span>➕</span>
            <span>Add Custom Field</span>
          </button>
        </div>

        {/* Company Selector */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <span className="mr-2">🏢</span>
            Select Company to Configure
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {companies.map((company) => (
              <button
                key={company.id}
                onClick={() => setSelectedCompany(company.id)}
                className={`p-4 rounded-xl border-2 transition-all text-left ${
                  selectedCompany === company.id
                    ? "border-purple-500 bg-purple-50 shadow-lg"
                    : "border-gray-200 hover:border-purple-300 hover:shadow-md"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    selectedCompany === company.id ? "bg-purple-500 text-white" : "bg-gray-100"
                  }`}>
                    🏢
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{company.name}</h3>
                    <p className="text-sm text-gray-600">
                      {mockFormConfigs[company.id] ? 
                        `${mockFormConfigs[company.id].fields.length} fields` : 
                        `${defaultFields.length} fields (default)`
                      }
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Form Configuration */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Default Fields (Locked) */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <span className="mr-2">🔒</span>
              Default Fields (Required)
            </h2>
            <p className="text-gray-600 text-sm mb-6">These fields are required for all companies and cannot be modified</p>
            
            <div className="space-y-3">
              {defaultFields.map((field) => (
                <div key={field.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900">{field.name}</h4>
                      <div className="flex items-center space-x-3 mt-1">
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded font-semibold">
                          {fieldTypes.find(t => t.id === field.type)?.name || field.type}
                        </span>
                        {field.required && (
                          <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded font-semibold">Required</span>
                        )}
                      </div>
                    </div>
                    <div className="text-gray-400">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Custom Fields */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <span className="mr-2">⚙️</span>
              Custom Fields for {formConfig.companyName}
            </h2>
            <p className="text-gray-600 text-sm mb-6">Customize additional fields specific to this company's needs</p>
            
            {customFields.length > 0 ? (
              <div className="space-y-3 mb-6">
                {customFields.map((field) => (
                  <div key={field.id} className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-200">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900">{field.name}</h4>
                        <div className="flex items-center space-x-3 mt-1">
                          <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded font-semibold">
                            {fieldTypes.find(t => t.id === field.type)?.name || field.type}
                          </span>
                          {field.required && (
                            <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded font-semibold">Required</span>
                          )}
                          {field.options && (
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded font-semibold">
                              {field.options.length} options
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEditField(field)}
                          className="text-blue-600 hover:text-blue-800 p-1"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteField(field.id)}
                          className="text-red-600 hover:text-red-800 p-1"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">📝</span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">No Custom Fields</h3>
                <p className="text-gray-600 text-sm mb-4">This company is using only the default drug fields</p>
                <button
                  onClick={handleAddField}
                  className="bg-purple-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-purple-600 transition-all"
                >
                  Add First Custom Field
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Form Preview */}
        <div className="mt-8 bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <span className="mr-2">👁️</span>
            Form Preview for {formConfig.companyName}
          </h2>
          <p className="text-gray-600 text-sm mb-6">This is how the drug input form will appear to company users</p>
          
          <div className="bg-gray-50 rounded-xl p-6 border-2 border-dashed border-gray-300">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Add New Drug - {formConfig.companyName}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {formConfig.fields.map((field) => (
                <div key={field.id} className={field.type === 'textarea' ? 'md:col-span-2' : ''}>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    {field.name} {field.required && <span className="text-red-500">*</span>}
                  </label>
                  {field.type === 'text' && (
                    <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white" placeholder={`Enter ${field.name.toLowerCase()}`} disabled />
                  )}
                  {field.type === 'textarea' && (
                    <textarea className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white" rows="3" placeholder={`Enter ${field.name.toLowerCase()}`} disabled></textarea>
                  )}
                  {field.type === 'select' && (
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white" disabled>
                      <option>Select {field.name.toLowerCase()}</option>
                      {field.options?.map((option, index) => (
                        <option key={index} value={option}>{option}</option>
                      ))}
                    </select>
                  )}
                  {field.type === 'date' && (
                    <input type="date" className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white" disabled />
                  )}
                  {field.type === 'file' && (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center bg-white">
                      <p className="text-sm text-gray-500">Click to upload {field.name.toLowerCase()}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-6 flex space-x-4">
              <button className="bg-gray-400 text-white px-6 py-2 rounded-lg font-semibold cursor-not-allowed">Cancel</button>
              <button className="bg-gray-400 text-white px-6 py-2 rounded-lg font-semibold cursor-not-allowed">Save Drug</button>
            </div>
          </div>
        </div>
      </main>

      {showFieldModal && (
        <FieldModal 
          field={editingField} 
          setShowModal={setShowFieldModal} 
          onSave={(fieldData) => {
            if (editingField) {
              // Edit existing field
              setFormConfig(prev => ({
                ...prev,
                fields: prev.fields.map(f => f.id === editingField.id ? { ...f, ...fieldData } : f)
              }));
            } else {
              // Add new field
              const newField = {
                id: fieldData.name.toLowerCase().replace(/\s+/g, '_'),
                ...fieldData
              };
              setFormConfig(prev => ({
                ...prev,
                fields: [...prev.fields, newField]
              }));
            }
            setShowFieldModal(false);
          }}
        />
      )}
    </div>
  );
}

function FieldModal({ field, setShowModal, onSave }) {
  const isEdit = !!field;
  const [fieldData, setFieldData] = useState({
    name: field?.name || "",
    type: field?.type || "text",
    required: field?.required || false,
    options: field?.options || []
  });
  const [newOption, setNewOption] = useState("");

  const handleAddOption = () => {
    if (newOption.trim() && !fieldData.options.includes(newOption.trim())) {
      setFieldData(prev => ({
        ...prev,
        options: [...prev.options, newOption.trim()]
      }));
      setNewOption("");
    }
  };

  const handleRemoveOption = (index) => {
    setFieldData(prev => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!fieldData.name.trim()) {
      alert("Field name is required");
      return;
    }
    onSave(fieldData);
  };

  const selectedFieldType = fieldTypes.find(t => t.id === fieldData.type);
  const needsOptions = ['select', 'multiselect'].includes(fieldData.type);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6 rounded-t-3xl flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-4xl">📝</span>
            <h2 className="text-2xl font-bold text-white">{isEdit ? 'Edit Field' : 'Add Custom Field'}</h2>
          </div>
          <button onClick={() => setShowModal(false)} className="text-white hover:bg-white/20 rounded-lg p-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Field Name *</label>
              <input 
                type="text" 
                value={fieldData.name}
                onChange={(e) => setFieldData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent" 
                placeholder="e.g., Mechanism of Action" 
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Field Type *</label>
              <div className="grid grid-cols-2 gap-3">
                {fieldTypes.map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setFieldData(prev => ({ ...prev, type: type.id, options: [] }))}
                    className={`p-3 rounded-xl border-2 transition-all text-left ${
                      fieldData.type === type.id
                        ? "border-purple-500 bg-purple-50"
                        : "border-gray-200 hover:border-purple-300"
                    }`}
                  >
                    <div className="flex items-center space-x-2 mb-1">
                      <span>{type.icon}</span>
                      <span className="font-semibold text-sm">{type.name}</span>
                    </div>
                    <p className="text-xs text-gray-600">{type.description}</p>
                  </button>
                ))}
              </div>
              {selectedFieldType && (
                <div className="mt-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                  <p className="text-sm text-purple-700">
                    <span className="font-semibold">Selected:</span> {selectedFieldType.name} - {selectedFieldType.description}
                  </p>
                </div>
              )}
            </div>

            {needsOptions && (
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Options *</label>
                <div className="space-y-3">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newOption}
                      onChange={(e) => setNewOption(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddOption())}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Enter option value"
                    />
                    <button
                      type="button"
                      onClick={handleAddOption}
                      className="bg-purple-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-purple-600 transition-all"
                    >
                      Add
                    </button>
                  </div>
                  {fieldData.options.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-gray-700">Current Options:</p>
                      <div className="flex flex-wrap gap-2">
                        {fieldData.options.map((option, index) => (
                          <span
                            key={index}
                            className="bg-purple-100 text-purple-700 px-3 py-1 rounded-lg text-sm font-semibold flex items-center space-x-2"
                          >
                            <span>{option}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveOption(index)}
                              className="text-purple-600 hover:text-purple-800 font-bold"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={fieldData.required}
                  onChange={(e) => setFieldData(prev => ({ ...prev, required: e.target.checked }))}
                  className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                />
                <span className="text-sm font-bold text-gray-700">Required Field</span>
              </label>
              <p className="text-xs text-gray-500 mt-1">Users must fill this field to save the drug</p>
            </div>
            
            <div className="flex space-x-4 pt-4">
              <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-300 transition-all">
                Cancel
              </button>
              <button type="submit" className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-xl font-bold hover:shadow-lg transition-all">
                {isEdit ? 'Update Field' : 'Add Field'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
