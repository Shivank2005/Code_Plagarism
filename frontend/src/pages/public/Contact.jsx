import React, { useState } from 'react';
import PublicNavbar from '../../components/public/PublicNavbar';
import {
  Mail,
  MessageSquare,
  Send,
  CheckCircle,
  User,
  Building2,
  Bug,
  Lightbulb,
  HelpCircle,
  Star,
} from 'lucide-react';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    type: 'General Inquiry',
    message: '',
    rating: 0,
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setSubmitted(false);
  };

  const handleRating = (rating) => {
    setFormData((prev) => ({
      ...prev,
      rating,
    }));

    setSubmitted(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (
      !formData.name.trim() ||
      !formData.email.trim() ||
      !formData.message.trim()
    ) {
      return;
    }

    /*
     * Currently handled on the frontend.
     * Later this can be connected to:
     * POST /api/feedback
     */

    console.log('Feedback submitted:', formData);

    setSubmitted(true);

    setFormData({
      name: '',
      email: '',
      subject: '',
      type: 'General Inquiry',
      message: '',
      rating: 0,
    });
  };

  return (
    <div
      className="min-h-screen overflow-x-hidden"
      style={{
        background: 'var(--bg-primary)',
        color: 'var(--text-primary)',
      }}
    >
      <PublicNavbar />

      <main className="w-full">

        {/* =====================================================
            HERO
        ====================================================== */}

        <section className="px-4 sm:px-6 pt-16 sm:pt-20 pb-12">

          <div className="max-w-4xl mx-auto text-center">

            <div
              className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-5 sm:mb-6 rounded-2xl flex items-center justify-center"
              style={{
                background: 'var(--accent-muted)',
                color: 'var(--accent-light)',
              }}
            >
              <MessageSquare size={30} />
            </div>

            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
              Contact{' '}
              <span style={{ color: 'var(--accent-light)' }}>
                PlagShield
              </span>
            </h1>

            <p
              className="mt-4 sm:mt-5 text-base sm:text-lg max-w-2xl mx-auto leading-7"
              style={{
                color: 'var(--text-secondary)',
              }}
            >
              Have a question, suggestion, or feedback?
              We'd love to hear from you.
            </p>

          </div>

        </section>


        {/* =====================================================
            CONTACT + FEEDBACK
        ====================================================== */}

        <section className="px-4 sm:px-6 pb-20">

          <div className="max-w-6xl mx-auto">

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* =================================================
                  LEFT INFORMATION
              ================================================== */}

              <div className="lg:col-span-1 space-y-5">

                {/* Contact Information */}

                <div className="card p-6">

                  <h2 className="text-xl font-bold">
                    Get in Touch
                  </h2>

                  <p
                    className="mt-3 text-sm leading-6"
                    style={{
                      color: 'var(--text-secondary)',
                    }}
                  >
                    Whether you have a question about PlagShield,
                    found an issue, or have an idea for improvement,
                    feel free to reach out.
                  </p>

                  <div className="mt-6 space-y-4">

                    <ContactItem
                      icon={<Mail size={19} />}
                      title="Email"
                      value="team@plagshield.example"
                    />

                    <ContactItem
                      icon={<Building2 size={19} />}
                      title="Institution"
                      value="Bangalore Institute of Technology"
                    />

                  </div>

                </div>


                {/* Project Information */}

                <div className="card p-6">

                  <h2 className="text-xl font-bold">
                    About the Project
                  </h2>

                  <p
                    className="mt-3 text-sm leading-7"
                    style={{
                      color: 'var(--text-secondary)',
                    }}
                  >
                    PlagShield is an intelligent source-code
                    plagiarism detection system that analyzes code
                    using token-based, structural, and semantic
                    similarity techniques.
                  </p>

                </div>


                {/* Team */}

                <div className="card p-6">

                  <h2 className="text-xl font-bold">
                    Development Team
                  </h2>

                  <div className="mt-4 space-y-3">

                    <TeamMember name="Priyanshu Prasad" />
                    <TeamMember name="Shivank Sharma" />
                    <TeamMember name="Krishmeet Singh" />
                    <TeamMember name="Raj Vardhan" />

                  </div>

                </div>

              </div>


              {/* =================================================
                  RIGHT CONTACT FORM
              ================================================== */}

              <div className="lg:col-span-2">

                <div className="card p-6 sm:p-8">

                  <div className="mb-7">

                    <h2 className="text-2xl font-bold">
                      Send us a Message
                    </h2>

                    <p
                      className="mt-2 text-sm"
                      style={{
                        color: 'var(--text-secondary)',
                      }}
                    >
                      Share your questions, feedback, or suggestions
                      with the PlagShield team.
                    </p>

                  </div>


                  {/* Success Message */}

                  {submitted && (
                    <div
                      className="mb-6 rounded-xl border p-4 flex items-start gap-3"
                      style={{
                        borderColor: 'rgba(34, 197, 94, 0.35)',
                        background: 'rgba(34, 197, 94, 0.08)',
                      }}
                    >

                      <CheckCircle
                        size={21}
                        className="flex-shrink-0 mt-0.5"
                        style={{
                          color: '#4ade80',
                        }}
                      />

                      <div>

                        <p className="font-semibold text-sm">
                          Message sent successfully!
                        </p>

                        <p
                          className="text-sm mt-1"
                          style={{
                            color: 'var(--text-secondary)',
                          }}
                        >
                          Thank you for your feedback. We appreciate
                          you taking the time to help improve PlagShield.
                        </p>

                      </div>

                    </div>
                  )}


                  <form
                    onSubmit={handleSubmit}
                    className="space-y-5"
                  >

                    {/* Name + Email */}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                      <FormInput
                        label="Your Name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Enter your name"
                        icon={<User size={17} />}
                        required
                      />

                      <FormInput
                        label="Email Address"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="you@example.com"
                        icon={<Mail size={17} />}
                        required
                      />

                    </div>


                    {/* Subject */}

                    <FormInput
                      label="Subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder="What would you like to tell us?"
                    />


                    {/* Feedback Type */}

                    <div>

                      <label className="block text-sm font-medium mb-2">
                        Type of Message
                      </label>

                      <select
                        name="type"
                        value={formData.type}
                        onChange={handleChange}
                        className="w-full rounded-lg border px-4 py-3 text-sm outline-none"
                        style={{
                          background: 'var(--bg-secondary)',
                          borderColor: 'var(--border-default)',
                          color: 'var(--text-primary)',
                        }}
                      >

                        <option>
                          General Inquiry
                        </option>

                        <option>
                          Feedback
                        </option>

                        <option>
                          Bug Report
                        </option>

                        <option>
                          Feature Suggestion
                        </option>

                        <option>
                          Collaboration
                        </option>

                      </select>

                    </div>


                    {/* Message */}

                    <div>

                      <label className="block text-sm font-medium mb-2">
                        Message
                        <span className="text-red-400 ml-1">
                          *
                        </span>
                      </label>

                      <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        rows={6}
                        required
                        placeholder="Write your question, feedback, or suggestion..."
                        className="w-full rounded-lg border px-4 py-3 text-sm outline-none resize-none"
                        style={{
                          background: 'var(--bg-secondary)',
                          borderColor: 'var(--border-default)',
                          color: 'var(--text-primary)',
                        }}
                      />

                    </div>


                    {/* Rating */}

                    <div>

                      <div className="flex items-center gap-2 mb-3">

                        <label className="text-sm font-medium">
                          How would you rate your experience?
                        </label>

                        <HelpCircle
                          size={15}
                          style={{
                            color: 'var(--text-secondary)',
                          }}
                        />

                      </div>

                      <div className="flex items-center gap-2">

                        {[1, 2, 3, 4, 5].map((rating) => (

                          <button
                            key={rating}
                            type="button"
                            onClick={() => handleRating(rating)}
                            className="transition-transform hover:scale-110"
                            aria-label={`Rate ${rating} out of 5`}
                          >

                            <Star
                              size={25}
                              fill={
                                formData.rating >= rating
                                  ? 'currentColor'
                                  : 'none'
                              }
                              style={{
                                color:
                                  formData.rating >= rating
                                    ? 'var(--accent-light)'
                                    : 'var(--text-secondary)',
                              }}
                            />

                          </button>

                        ))}

                        {formData.rating > 0 && (
                          <span
                            className="text-sm ml-2"
                            style={{
                              color: 'var(--text-secondary)',
                            }}
                          >
                            {formData.rating}/5
                          </span>
                        )}

                      </div>

                    </div>


                    {/* Submit */}

                    <button
                      type="submit"
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3 rounded-lg font-semibold text-sm transition-all"
                      style={{
                        background: 'var(--accent)',
                        color: 'white',
                      }}
                    >

                      <Send size={17} />

                      Send Message

                    </button>

                  </form>

                </div>

              </div>

            </div>

          </div>

        </section>

      </main>

    </div>
  );
};


/* ============================================================
   CONTACT ITEM
============================================================ */

const ContactItem = ({
  icon,
  title,
  value,
}) => {
  return (
    <div className="flex items-start gap-3">

      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{
          background: 'var(--accent-muted)',
          color: 'var(--accent-light)',
        }}
      >
        {icon}
      </div>

      <div className="min-w-0">

        <p
          className="text-xs uppercase tracking-wider font-semibold"
          style={{
            color: 'var(--text-secondary)',
          }}
        >
          {title}
        </p>

        <p
          className="text-sm mt-1 break-words"
          style={{
            color: 'var(--text-primary)',
          }}
        >
          {value}
        </p>

      </div>

    </div>
  );
};


/* ============================================================
   TEAM MEMBER
============================================================ */

const TeamMember = ({ name }) => {
  return (
    <div className="flex items-center gap-3">

      <div
        className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
        style={{
          background: 'var(--accent-muted)',
          color: 'var(--accent-light)',
        }}
      >
        <User size={17} />
      </div>

      <div>

        <p className="text-sm font-medium">
          {name}
        </p>

        <p
          className="text-xs mt-0.5"
          style={{
            color: 'var(--text-secondary)',
          }}
        >
          Developer
        </p>

      </div>

    </div>
  );
};


/* ============================================================
   FORM INPUT
============================================================ */

const FormInput = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  icon,
  required = false,
}) => {
  return (
    <div>

      <label className="block text-sm font-medium mb-2">

        {label}

        {required && (
          <span className="text-red-400 ml-1">
            *
          </span>
        )}

      </label>

      <div className="relative">

        {icon && (
          <div
            className="absolute left-3 top-1/2 -translate-y-1/2"
            style={{
              color: 'var(--text-secondary)',
            }}
          >
            {icon}
          </div>
        )}

        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className={`w-full rounded-lg border px-4 py-3 text-sm outline-none ${
            icon ? 'pl-10' : ''
          }`}
          style={{
            background: 'var(--bg-secondary)',
            borderColor: 'var(--border-default)',
            color: 'var(--text-primary)',
          }}
        />

      </div>

    </div>
  );
};

export default Contact;