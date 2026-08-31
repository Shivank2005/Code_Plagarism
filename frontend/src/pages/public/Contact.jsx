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

const Contact = ({ embedded = false }) => {
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
    <div className="min-h-screen overflow-x-hidden bg-white text-[#0F172A]">

      {!embedded && <PublicNavbar />}

      <main className="w-full">

        {/* HERO */}

        {!embedded && (
          <section className="relative overflow-hidden px-4 pb-12 pt-16 sm:px-6 sm:pt-20">
            <div className="pointer-events-none absolute left-1/2 top-[-180px] h-[450px] w-[650px] -translate-x-1/2 rounded-full bg-[#EFF6FF] opacity-70 blur-3xl" />

            <div className="relative mx-auto max-w-4xl text-center">

              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EFF6FF] text-[#2563EB] sm:mb-6 sm:h-16 sm:w-16">
                <MessageSquare size={30} />
              </div>

              <h1 className="text-4xl font-bold tracking-tight text-[#0F172A] sm:text-5xl">
                Contact{' '}
                <span className="text-[#2563EB]">
                  PlagShield
                </span>
              </h1>

              <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-[#64748B] sm:mt-5 sm:text-lg">
                Have a question, suggestion, or feedback?
                We'd love to hear from you.
              </p>

            </div>
          </section>
        )}


        {/* CONTACT + FEEDBACK */}

        <section className={`px-4 pb-20 sm:px-6 ${embedded ? 'pt-12 sm:pt-14' : ''}`}>
          <div className="mx-auto max-w-6xl">

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

              {/* LEFT INFORMATION */}

              <div className="space-y-5 lg:col-span-1">

                {/* Contact Information */}

                <div className="rounded-xl border border-[#E2E8F0] bg-white p-6 shadow-sm">

                  <h2 className="text-2xl font-bold text-[#0F172A]">
                    Get in Touch
                  </h2>

                  <p className="mt-3 text-base leading-6 text-[#64748B]">
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

                <div className="rounded-xl border border-[#E2E8F0] bg-white p-6 shadow-sm">

                  <h2 className="text-2xl font-bold text-[#0F172A]">
                    About the Project
                  </h2>

                  <p className="mt-3 text-base leading-7 text-[#64748B]">
                    PlagShield is an intelligent source-code
                    plagiarism detection system that analyzes code
                    using token-based, structural, and semantic
                    similarity techniques.
                  </p>

                </div>


                {/* Team */}

                <div className="rounded-xl border border-[#E2E8F0] bg-white p-6 shadow-sm">

                  <h2 className="text-2xl font-bold text-[#0F172A]">
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


              {/* RIGHT CONTACT FORM */}

              <div className="lg:col-span-2">

                <div className="rounded-xl border border-[#E2E8F0] bg-white p-6 shadow-sm sm:p-8">

                  <div className="mb-7">

                    <h2 className="text-2xl font-bold text-[#0F172A]">
                      Send us a Message
                    </h2>

                    <p className="mt-2 text-base text-[#64748B]">
                      Share your questions, feedback, or suggestions
                      with the PlagShield team.
                    </p>

                  </div>


                  {/* Success Message */}

                  {submitted && (
                    <div className="mb-6 flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-4">

                      <CheckCircle
                        size={21}
                        className="mt-0.5 flex-shrink-0 text-green-600"
                      />

                      <div>

                        <p className="text-base font-semibold text-[#0F172A]">
                          Message sent successfully!
                        </p>

                        <p className="mt-1 text-base text-[#64748B]">
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

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

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

                      <label className="mb-2 block text-base font-medium text-[#0F172A]">
                        Type of Message
                      </label>

                      <select
                        name="type"
                        value={formData.type}
                        onChange={handleChange}
                        className="w-full rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3 text-base text-[#0F172A] outline-none transition-all focus:border-[#2563EB] focus:ring-2 focus:ring-[#EFF6FF]"
                      >
                        <option>General Inquiry</option>
                        <option>Feedback</option>
                        <option>Bug Report</option>
                        <option>Feature Suggestion</option>
                        <option>Collaboration</option>
                      </select>

                    </div>


                    {/* Message */}

                    <div>

                      <label className="mb-2 block text-base font-medium text-[#0F172A]">
                        Message
                        <span className="ml-1 text-red-500">
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
                        className="w-full resize-none rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3 text-base text-[#0F172A] outline-none transition-all placeholder:text-[#94A3B8] focus:border-[#2563EB] focus:ring-2 focus:ring-[#EFF6FF]"
                      />

                    </div>


                    {/* Rating */}

                    <div>

                      <div className="mb-3 flex items-center gap-2">

                        <label className="text-base font-medium text-[#0F172A]">
                          How would you rate your experience?
                        </label>

                        <HelpCircle
                          size={15}
                          className="text-[#64748B]"
                        />

                      </div>

                      <div className="flex items-center gap-2">

                        {[1, 2, 3, 4, 5].map((rating) => (
                          <button
                            key={rating}
                            type="button"
                            onClick={() => handleRating(rating)}
                            className="text-[#94A3B8] transition-transform hover:scale-110"
                            aria-label={`Rate ${rating} out of 5`}
                          >
                            <Star
                              size={25}
                              fill={
                                formData.rating >= rating
                                  ? 'currentColor'
                                  : 'none'
                              }
                              className={
                                formData.rating >= rating
                                  ? 'text-[#2563EB]'
                                  : 'text-[#CBD5E1]'
                              }
                            />
                          </button>
                        ))}

                        {formData.rating > 0 && (
                          <span className="ml-2 text-base text-[#64748B]">
                            {formData.rating}/5
                          </span>
                        )}

                      </div>

                    </div>


                    {/* Submit */}

                    <button
                      type="submit"
                      className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#2563EB] px-7 py-3 text-base font-semibold text-white shadow-sm transition-all duration-200 hover:bg-[#1D4ED8] hover:shadow-md sm:w-auto"
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


/* CONTACT ITEM */

const ContactItem = ({
  icon,
  title,
  value,
}) => {
  return (
    <div className="flex items-start gap-3">

      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-[#EFF6FF] text-[#2563EB]">
        {icon}
      </div>

      <div className="min-w-0">

        <p className="text-base font-semibold uppercase tracking-wider text-[#64748B]">
          {title}
        </p>

        <p className="mt-1 break-words text-base text-[#0F172A]">
          {value}
        </p>

      </div>

    </div>
  );
};


/* TEAM MEMBER */

const TeamMember = ({ name }) => {
  return (
    <div className="flex items-center gap-3">

      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[#EFF6FF] text-[#2563EB]">
        <User size={17} />
      </div>

      <div>

        <p className="text-base font-medium text-[#0F172A]">
          {name}
        </p>

        <p className="mt-0.5 text-base text-[#64748B]">
          Developer
        </p>

      </div>

    </div>
  );
};


/* FORM INPUT */

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

      <label className="mb-2 block text-base font-medium text-[#0F172A]">
        {label}

        {required && (
          <span className="ml-1 text-red-500">
            *
          </span>
        )}
      </label>

      <div className="relative">

        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]">
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
          className={`w-full rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3 text-base text-[#0F172A] outline-none transition-all placeholder:text-[#94A3B8] focus:border-[#2563EB] focus:bg-white focus:ring-2 focus:ring-[#EFF6FF] ${
            icon ? 'pl-10' : ''
          }`}
        />

      </div>

    </div>
  );
};

export default Contact;