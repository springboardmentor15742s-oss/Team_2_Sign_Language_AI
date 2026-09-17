import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Mail,
  MapPin,
  Camera,
  Target,
  Languages,
  Save,
  ArrowLeft,
  Loader2,
} from 'lucide-react';

import { useForm } from 'react-hook-form';

import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Breadcrumb } from '../../components/layout/Breadcrumb';

import { useToast } from '../../hooks/useToast';
import { useAuth } from '../../hooks/useAuth';

import {
  SIGN_LANGUAGES,
  SKILL_LEVELS,
} from '../../constants/navigation';

import { profileService } from '../../services/profileService';


const goalOptions = [
  'Daily Conversation',
  'Travel Communication',
  'Academic Learning',
  'Professional Communication',
  'Accessibility & Inclusion',
];


export default function EditProfile() {

  const navigate = useNavigate();

  const { addToast } = useToast();

  const {
    user,
    updateUser,
  } = useAuth();


  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);


  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: {
      errors,
    },
  } = useForm({
    defaultValues: {
      full_name: '',
      email: '',
      location: '',
      bio: '',
      avatar_url: '',
      preferred_language: 'ASL',
      learning_level: 'beginner',
      learning_goals: [],
    },
  });


  /* =======================================================
     LOAD PROFILE
  ======================================================= */

  useEffect(() => {

    let active = true;


    const loadProfile = async () => {

      try {

        const response =
          await profileService.getProfile();

        if (!active) {
          return;
        }

        const profile =
          response.data;


        reset({
          full_name:
            profile.full_name || '',
          email:
            profile.email || '',
          location:
            profile.location || '',
          bio:
            profile.bio || '',
          avatar_url:
            profile.avatar_url || '',
          preferred_language:
            profile.preferred_language ||
            'ASL',
          learning_level:
            profile.learning_level ||
            'beginner',
          learning_goals:
            Array.isArray(
              profile.learning_goals
            )
              ? profile.learning_goals
              : [],
        });

      } catch (error) {

        console.error(
          'Unable to load profile:',
          error
        );

        addToast(
          'Unable to load profile information',
          'error'
        );

      } finally {

        if (active) {
          setLoading(false);
        }

      }

    };


    loadProfile();


    return () => {
      active = false;
    };

  }, [reset, addToast]);


  /* =======================================================
     GOALS
  ======================================================= */

  const goals =
    watch('learning_goals') || [];


  const avatarUrl =
    watch('avatar_url');


  const toggleGoal = (goal) => {

    const nextGoals =
      goals.includes(goal)
        ? goals.filter(
            (item) =>
              item !== goal
          )
        : [
            ...goals,
            goal,
          ];


    setValue(
      'learning_goals',
      nextGoals,
      {
        shouldDirty: true,
      }
    );

  };


  /* =======================================================
     SAVE PROFILE
  ======================================================= */

  const submit = async (data) => {

    try {

      setSaving(true);


      const payload = {
        full_name:
          data.full_name?.trim(),
        location:
          data.location?.trim() ||
          null,
        bio:
          data.bio?.trim() ||
          null,
        avatar_url:
          data.avatar_url?.trim() ||
          null,
        preferred_language:
          data.preferred_language,
        learning_level:
          data.learning_level,
        learning_goals:
          data.learning_goals || [],
      };


      const response =
        await profileService.updateProfile(
          payload
        );


      updateUser(
        response.data
      );


      addToast(
        'Profile updated successfully',
        'success'
      );


      navigate('/profile');

    } catch (error) {

      console.error(
        'Profile update failed:',
        error
      );


      addToast(
        error.response?.data
          ?.detail ||
          'Unable to update profile',
        'error'
      );

    } finally {

      setSaving(false);

    }

  };


  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {

    return (

      <div
        className="
          min-h-[60vh]
          flex
          items-center
          justify-center
        "
      >

        <div className="text-center">

          <Loader2
            size={34}
            className="
              mx-auto
              animate-spin
              text-[#20d8d3]
            "
          />

          <p
            className="
              mt-4
              text-sm
              text-slate-500
            "
          >
            Loading profile editor...
          </p>

        </div>

      </div>

    );

  }


  /* =======================================================
     UI
  ======================================================= */

  return (

    <div
      className="
        max-w-5xl
        mx-auto
        space-y-6
      "
    >

      <Breadcrumb
        items={[
          {
            label: 'Account',
          },
          {
            label: 'Profile',
            path: '/profile',
          },
          {
            label: 'Edit',
          },
        ]}
      />


      {/* ===================================================
          HEADER
      =================================================== */}

      <section
        className="
          relative
          overflow-hidden
          rounded-3xl
          border
          border-slate-800
          bg-gradient-to-br
          from-[#0d1720]
          via-[#111827]
          to-[#1a1730]
          px-6
          py-7
          sm:px-8
        "
      >

        <div
          className="
            absolute
            right-0
            top-0
            h-40
            w-40
            rounded-full
            bg-cyan-500/10
            blur-3xl
          "
        />


        <div
          className="
            relative
            flex
            flex-col
            md:flex-row
            md:items-center
            md:justify-between
            gap-5
          "
        >

          <div>

            <div
              className="
                inline-flex
                items-center
                gap-2
                rounded-full
                border
                border-cyan-500/15
                bg-cyan-500/10
                px-3
                py-1.5
                text-xs
                font-semibold
                text-[#20d8d3]
              "
            >

              <User size={13} />

              Account Profile

            </div>


            <h1
              className="
                mt-4
                text-2xl
                sm:text-3xl
                font-bold
                text-white
              "
            >
              Personalize your learning profile
            </h1>


            <p
              className="
                mt-2
                max-w-2xl
                text-sm
                leading-6
                text-slate-500
              "
            >
              Keep your personal details, learning level,
              goals and sign-language preference up to date.
            </p>

          </div>


          <Button
            variant="outline"
            type="button"
            onClick={() =>
              navigate('/profile')
            }
          >

            <ArrowLeft size={15} />

            Back to Profile

          </Button>

        </div>

      </section>


      {/* ===================================================
          FORM
      =================================================== */}

      <form
        onSubmit={
          handleSubmit(submit)
        }
        className="space-y-6"
      >


        {/* PROFILE IMAGE */}

        <Card padding="large">

          <SectionHeader
            icon={Camera}
            title="Profile Photo"
            subtitle="Add a hosted image URL for your account avatar."
          />


          <div
            className="
              mt-6
              flex
              flex-col
              sm:flex-row
              gap-6
              sm:items-center
            "
          >

            <div
              className="
                h-28
                w-28
                shrink-0
                overflow-hidden
                rounded-3xl
                border
                border-slate-800
                bg-gradient-to-br
                from-cyan-500/10
                to-violet-500/10
                flex
                items-center
                justify-center
              "
            >

              {
                avatarUrl ? (

                  <img
                    src={avatarUrl}
                    alt="Profile preview"
                    className="
                      h-full
                      w-full
                      object-cover
                    "
                    onError={(event) => {
                      event.currentTarget.style.display =
                        'none';
                    }}
                  />

                ) : (

                  <User
                    size={38}
                    className="
                      text-[#20d8d3]
                    "
                  />

                )
              }

            </div>


            <div className="flex-1">

              <Input
                label="Avatar URL"
                placeholder="https://example.com/avatar.jpg"
                {...register(
                  'avatar_url'
                )}
              />

              <p
                className="
                  mt-2
                  text-xs
                  text-slate-600
                "
              >
                Use a public HTTPS image URL.
              </p>

            </div>

          </div>

        </Card>


        {/* PERSONAL INFO */}

        <Card padding="large">

          <SectionHeader
            icon={User}
            title="Personal Information"
            subtitle="Basic information associated with your account."
          />


          <div
            className="
              mt-6
              grid
              md:grid-cols-2
              gap-5
            "
          >

            <div>

              <Input
                label="Full Name"
                icon={User}
                placeholder="Your full name"
                {...register(
                  'full_name',
                  {
                    required:
                      'Name is required',
                  }
                )}
              />

              {
                errors.full_name && (

                  <p
                    className="
                      mt-1
                      text-xs
                      text-red-400
                    "
                  >
                    {
                      errors.full_name
                        .message
                    }
                  </p>

                )
              }

            </div>


            <Input
              label="Email"
              type="email"
              icon={Mail}
              value={
                user?.email || ''
              }
              readOnly
            />


            <Input
              label="Location"
              icon={MapPin}
              placeholder="City, Country"
              {...register(
                'location'
              )}
            />


            <div
              className="
                md:col-span-2
              "
            >

              <Textarea
                label="Bio"
                placeholder="Tell us a little about yourself and your learning journey..."
                rows={5}
                {...register(
                  'bio'
                )}
              />

            </div>

          </div>

        </Card>


        {/* LEARNING SETTINGS */}

        <Card padding="large">

          <SectionHeader
            icon={Languages}
            title="Learning Preferences"
            subtitle="These preferences help SignSpeak tailor your learning experience."
          />


          <div
            className="
              mt-6
              grid
              md:grid-cols-2
              gap-5
            "
          >

            <Select
              label="Preferred Sign Language"
              options={
                SIGN_LANGUAGES
              }
              {...register(
                'preferred_language'
              )}
            />


            <Select
              label="Current Skill Level"
              options={
                SKILL_LEVELS
              }
              {...register(
                'learning_level'
              )}
            />


            <div
              className="
                md:col-span-2
              "
            >

              <div
                className="
                  flex
                  items-center
                  gap-2
                  mb-3
                "
              >

                <Target
                  size={15}
                  className="
                    text-[#20d8d3]
                  "
                />

                <label
                  className="
                    text-sm
                    font-medium
                    text-slate-300
                  "
                >
                  Learning Goals
                </label>

              </div>


              <div
                className="
                  grid
                  sm:grid-cols-2
                  lg:grid-cols-3
                  gap-2
                "
              >

                {
                  goalOptions.map(
                    (goal) => {

                      const selected =
                        goals.includes(
                          goal
                        );


                      return (

                        <button
                          key={goal}
                          type="button"
                          onClick={() =>
                            toggleGoal(
                              goal
                            )
                          }
                          className={`
                            rounded-xl
                            border
                            px-4
                            py-3
                            text-left
                            text-xs
                            font-medium
                            transition-all
                            ${
                              selected
                                ? `
                                  border-cyan-500/30
                                  bg-cyan-500/10
                                  text-[#20d8d3]
                                `
                                : `
                                  border-slate-800
                                  bg-[#11161f]
                                  text-slate-500
                                  hover:border-slate-700
                                  hover:text-slate-300
                                `
                            }
                          `}
                        >

                          <div
                            className="
                              flex
                              items-center
                              justify-between
                              gap-3
                            "
                          >

                            <span>
                              {goal}
                            </span>


                            <span
                              className={`
                                h-4
                                w-4
                                shrink-0
                                rounded-full
                                border
                                flex
                                items-center
                                justify-center
                                ${
                                  selected
                                    ? `
                                      border-[#20d8d3]
                                      bg-[#20d8d3]
                                    `
                                    : `
                                      border-slate-700
                                    `
                                }
                              `}
                            >

                              {
                                selected && (

                                  <span
                                    className="
                                      h-1.5
                                      w-1.5
                                      rounded-full
                                      bg-[#071214]
                                    "
                                  />

                                )
                              }

                            </span>

                          </div>

                        </button>

                      );

                    }
                  )
                }

              </div>

            </div>

          </div>

        </Card>


        {/* SAVE ACTIONS */}

        <div
          className="
            sticky
            bottom-4
            z-10
            rounded-2xl
            border
            border-slate-800
            bg-[#0d121a]/95
            p-4
            backdrop-blur-xl
            shadow-2xl
          "
        >

          <div
            className="
              flex
              flex-col
              sm:flex-row
              sm:items-center
              sm:justify-between
              gap-3
            "
          >

            <p
              className="
                text-xs
                text-slate-600
              "
            >
              Changes are saved directly to your SignSpeak profile.
            </p>


            <div
              className="
                flex
                items-center
                gap-3
              "
            >

              <Button
                type="button"
                variant="ghost"
                disabled={saving}
                onClick={() =>
                  navigate('/profile')
                }
              >
                Cancel
              </Button>


              <Button
                type="submit"
                loading={saving}
                disabled={saving}
              >

                <Save size={15} />

                Save Changes

              </Button>

            </div>

          </div>

        </div>

      </form>

    </div>

  );

}


/* =========================================================
   SECTION HEADER
========================================================= */

function SectionHeader({
  icon: Icon,
  title,
  subtitle,
}) {

  return (

    <div
      className="
        flex
        items-start
        gap-3
      "
    >

      <div
        className="
          h-10
          w-10
          shrink-0
          rounded-xl
          border
          border-cyan-500/10
          bg-cyan-500/10
          text-[#20d8d3]
          flex
          items-center
          justify-center
        "
      >

        <Icon size={18} />

      </div>


      <div>

        <h2
          className="
            text-sm
            font-bold
            text-white
          "
        >
          {title}
        </h2>

        <p
          className="
            mt-1
            text-xs
            leading-5
            text-slate-500
          "
        >
          {subtitle}
        </p>

      </div>

    </div>

  );

}