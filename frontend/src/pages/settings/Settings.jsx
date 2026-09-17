import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import {
  ArrowRight,
  Bell,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  Save,
  Settings2,
  Shield,
  ShieldCheck,
  Sparkles,
  User,
} from 'lucide-react';

import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Breadcrumb } from '../../components/layout/Breadcrumb';

import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { settingsService } from '../../services/settingsService';


export default function Settings() {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [saving, setSaving] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      current_password: '',
      new_password: '',
      confirm_password: '',
    },
  });

  const newPassword = watch('new_password');


  /* =====================================================
     PASSWORD UPDATE
  ===================================================== */

  const updatePassword = async (data) => {
    if (data.new_password !== data.confirm_password) {
      addToast('New passwords do not match', 'error');
      return;
    }

    try {
      setSaving(true);

      await settingsService.updatePassword({
        current_password: data.current_password,
        new_password: data.new_password,
      });

      addToast(
        'Password updated successfully',
        'success'
      );

      reset();
    } catch (error) {
      console.error(
        'Password update failed:',
        error
      );

      addToast(
        error.response?.data?.detail ||
          'Unable to update password',
        'error'
      );
    } finally {
      setSaving(false);
    }
  };


  return (
    <div className="max-w-[1180px] mx-auto space-y-6">

      <Breadcrumb
        items={[
          { label: 'Account' },
          { label: 'Settings' },
        ]}
      />


      {/* =================================================
          HERO
      ================================================= */}

      <section
        className="
          relative overflow-hidden
          rounded-[28px]
          border border-slate-800
          bg-[#10151e]
        "
      >
        <div
          className="
            absolute inset-0
            bg-gradient-to-r
            from-cyan-500/[0.07]
            via-transparent
            to-violet-500/[0.06]
          "
        />

        <div
          className="
            absolute -right-24 -top-24
            h-72 w-72 rounded-full
            bg-cyan-400/[0.08]
            blur-3xl
          "
        />

        <div className="relative px-6 py-8 sm:px-8">

          <div
            className="
              flex flex-col
              lg:flex-row
              lg:items-center
              lg:justify-between
              gap-6
            "
          >
            <div>

              <div
                className="
                  inline-flex items-center gap-2
                  rounded-full
                  border border-cyan-500/15
                  bg-cyan-500/[0.07]
                  px-3 py-1.5
                  text-[11px] font-semibold
                  text-[#20d8d3]
                "
              >
                <Settings2 size={13} />
                ACCOUNT CENTER
              </div>

              <h1
                className="
                  mt-4
                  text-3xl
                  font-bold
                  tracking-tight
                  text-white
                "
              >
                Account & Security
              </h1>

              <p
                className="
                  mt-2
                  max-w-xl
                  text-sm
                  leading-6
                  text-slate-500
                "
              >
                Manage your SignSpeak identity,
                password and account access from
                one place.
              </p>

            </div>


            <div
              className="
                flex items-center gap-3
                rounded-2xl
                border border-slate-800
                bg-black/10
                px-4 py-3
              "
            >
              <div
                className="
                  h-10 w-10
                  rounded-xl
                  bg-emerald-500/10
                  flex items-center justify-center
                "
              >
                <ShieldCheck
                  size={19}
                  className="text-emerald-400"
                />
              </div>

              <div>
                <p
                  className="
                    text-[10px]
                    uppercase tracking-wider
                    font-bold
                    text-slate-600
                  "
                >
                  Account Status
                </p>

                <p
                  className="
                    mt-0.5
                    text-sm font-semibold
                    text-slate-200
                  "
                >
                  Protected
                </p>
              </div>
            </div>

          </div>

        </div>
      </section>


      {/* =================================================
          ACCOUNT OVERVIEW
      ================================================= */}

      <div
        className="
          grid
          lg:grid-cols-[340px_1fr]
          gap-6
          items-start
        "
      >

        {/* LEFT SIDE */}

        <div className="space-y-4">

          <section
            className="
              rounded-3xl
              border border-slate-800
              bg-[#11161f]
              p-6
            "
          >

            <div
              className="
                h-16 w-16
                rounded-2xl
                border border-cyan-500/10
                bg-gradient-to-br
                from-cyan-500/15
                to-violet-500/10
                flex items-center justify-center
              "
            >
              <User
                size={27}
                className="text-[#20d8d3]"
              />
            </div>


            <p
              className="
                mt-5
                text-[10px]
                font-bold
                uppercase
                tracking-[0.16em]
                text-slate-600
              "
            >
              Signed in as
            </p>

            <h2
              className="
                mt-1
                text-lg
                font-bold
                text-white
              "
            >
              {user?.full_name || 'SignSpeak Learner'}
            </h2>

            <p
              className="
                mt-1
                break-all
                text-xs
                text-slate-500
              "
            >
              {user?.email || 'Account email'}
            </p>


            <div
              className="
                my-5
                border-t
                border-slate-800
              "
            />


            <Link
              to="/profile/edit"
              className="
                group
                flex items-center
                justify-between
                rounded-xl
                border border-slate-800
                bg-[#0d1219]
                px-4 py-3
                transition
                hover:border-cyan-500/20
              "
            >
              <div>
                <p
                  className="
                    text-xs
                    font-semibold
                    text-slate-300
                  "
                >
                  Edit Profile
                </p>

                <p
                  className="
                    mt-0.5
                    text-[10px]
                    text-slate-600
                  "
                >
                  Personal & learning details
                </p>
              </div>

              <ArrowRight
                size={15}
                className="
                  text-slate-600
                  transition
                  group-hover:translate-x-0.5
                  group-hover:text-[#20d8d3]
                "
              />
            </Link>


            <Link
              to="/notifications"
              className="
                group
                mt-2
                flex items-center
                justify-between
                rounded-xl
                border border-slate-800
                bg-[#0d1219]
                px-4 py-3
                transition
                hover:border-cyan-500/20
              "
            >
              <div>
                <p
                  className="
                    text-xs
                    font-semibold
                    text-slate-300
                  "
                >
                  Notifications
                </p>

                <p
                  className="
                    mt-0.5
                    text-[10px]
                    text-slate-600
                  "
                >
                  Learning updates & alerts
                </p>
              </div>

              <Bell
                size={15}
                className="
                  text-slate-600
                  group-hover:text-[#20d8d3]
                "
              />
            </Link>

          </section>


          {/* SECURITY NOTE */}

          <section
            className="
              rounded-2xl
              border border-emerald-500/10
              bg-emerald-500/[0.025]
              p-5
            "
          >
            <div className="flex gap-3">

              <Shield
                size={17}
                className="
                  mt-0.5
                  shrink-0
                  text-emerald-400
                "
              />

              <div>
                <p
                  className="
                    text-xs
                    font-semibold
                    text-slate-300
                  "
                >
                  Security tip
                </p>

                <p
                  className="
                    mt-1
                    text-[11px]
                    leading-5
                    text-slate-600
                  "
                >
                  Use a unique password that you
                  don't use for your email or other
                  accounts.
                </p>
              </div>

            </div>
          </section>

        </div>


        {/* =================================================
            PASSWORD PANEL
        ================================================= */}

        <section
          className="
            overflow-hidden
            rounded-3xl
            border border-slate-800
            bg-[#11161f]
          "
        >

          <div
            className="
              border-b border-slate-800
              px-6 py-5
              sm:px-7
            "
          >
            <div className="flex items-center gap-3">

              <div
                className="
                  h-10 w-10
                  rounded-xl
                  bg-cyan-500/10
                  flex items-center justify-center
                "
              >
                <KeyRound
                  size={18}
                  className="text-[#20d8d3]"
                />
              </div>

              <div>
                <h2
                  className="
                    text-sm
                    font-bold
                    text-white
                  "
                >
                  Change Password
                </h2>

                <p
                  className="
                    mt-0.5
                    text-xs
                    text-slate-500
                  "
                >
                  Update your account password securely.
                </p>
              </div>

            </div>
          </div>


          <form
            onSubmit={handleSubmit(updatePassword)}
            className="p-6 sm:p-7"
          >

            <div className="max-w-xl space-y-6">

              <PasswordField
                title="Current password"
                description="Enter the password you currently use."
                visible={showCurrent}
                onToggle={() =>
                  setShowCurrent((value) => !value)
                }
                error={errors.current_password?.message}
                register={register('current_password', {
                  required: 'Current password is required',
                })}
              />


              <div
                className="
                  border-t
                  border-slate-800
                "
              />


              <PasswordField
                title="New password"
                description="Choose a new password with at least 8 characters."
                visible={showNew}
                onToggle={() =>
                  setShowNew((value) => !value)
                }
                error={errors.new_password?.message}
                register={register('new_password', {
                  required: 'New password is required',
                  minLength: {
                    value: 8,
                    message:
                      'Password must be at least 8 characters',
                  },
                })}
              />


              <PasswordField
                title="Confirm new password"
                description="Enter your new password once more."
                visible={showConfirm}
                onToggle={() =>
                  setShowConfirm((value) => !value)
                }
                error={errors.confirm_password?.message}
                register={register('confirm_password', {
                  required:
                    'Please confirm your new password',
                  validate: (value) =>
                    value === newPassword ||
                    'Passwords do not match',
                })}
              />


              {/* REQUIREMENT */}

              <div
                className="
                  rounded-2xl
                  border border-slate-800
                  bg-[#0d1219]
                  p-4
                "
              >
                <div className="flex items-center gap-3">

                  <CheckCircle2
                    size={16}
                    className="text-[#20d8d3]"
                  />

                  <div>
                    <p
                      className="
                        text-xs
                        font-semibold
                        text-slate-300
                      "
                    >
                      Password requirement
                    </p>

                    <p
                      className="
                        mt-0.5
                        text-[11px]
                        text-slate-600
                      "
                    >
                      Minimum of 8 characters.
                    </p>
                  </div>

                </div>
              </div>


              <div
                className="
                  flex items-center
                  justify-between
                  gap-4
                  pt-1
                "
              >
                <p
                  className="
                    hidden sm:block
                    text-[11px]
                    text-slate-600
                  "
                >
                  Your current password is required
                  before making this change.
                </p>

                <Button
                  type="submit"
                  loading={saving}
                  disabled={saving}
                >
                  <Save size={15} />
                  Update Password
                </Button>
              </div>

            </div>

          </form>

        </section>

      </div>


      {/* =================================================
          BOTTOM INFO STRIP
      ================================================= */}

      <section
        className="
          rounded-2xl
          border border-slate-800
          bg-[#0e131b]
          px-5 py-4
        "
      >
        <div
          className="
            flex flex-col
            sm:flex-row
            sm:items-center
            sm:justify-between
            gap-3
          "
        >
          <div className="flex items-center gap-3">

            <Sparkles
              size={16}
              className="text-[#20d8d3]"
            />

            <div>
              <p
                className="
                  text-xs
                  font-semibold
                  text-slate-300
                "
              >
                Your learning preferences live in Profile
              </p>

              <p
                className="
                  mt-0.5
                  text-[10px]
                  text-slate-600
                "
              >
                Level, goals and sign-language preferences
                can be changed from Edit Profile.
              </p>
            </div>

          </div>

          <Link
            to="/profile/edit"
            className="
              text-xs
              font-semibold
              text-[#20d8d3]
              hover:text-cyan-300
            "
          >
            Manage profile →
          </Link>

        </div>
      </section>

    </div>
  );
}


/* =========================================================
   PASSWORD FIELD
========================================================= */

function PasswordField({
  title,
  description,
  visible,
  onToggle,
  register,
  error,
}) {
  return (
    <div>

      <div className="mb-3">
        <label
          className="
            text-xs
            font-semibold
            text-slate-300
          "
        >
          {title}
        </label>

        <p
          className="
            mt-1
            text-[11px]
            text-slate-600
          "
        >
          {description}
        </p>
      </div>


      <div className="relative">

        <Input
          type={visible ? 'text' : 'password'}
          icon={Lock}
          placeholder="••••••••"
          {...register}
        />

        <button
          type="button"
          onClick={onToggle}
          aria-label={
            visible
              ? 'Hide password'
              : 'Show password'
          }
          className="
            absolute
            right-3
            top-1/2
            -translate-y-1/2
            rounded-lg
            p-1.5
            text-slate-600
            transition
            hover:bg-slate-800
            hover:text-slate-300
          "
        >
          {visible ? (
            <EyeOff size={16} />
          ) : (
            <Eye size={16} />
          )}
        </button>

      </div>


      {error && (
        <p
          className="
            mt-2
            text-xs
            text-red-400
          "
        >
          {error}
        </p>
      )}

    </div>
  );
}