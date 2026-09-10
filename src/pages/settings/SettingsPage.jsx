import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "@heroui/react";
import {
  IoColorPaletteOutline,
  IoAppsOutline,
  IoNotificationsOutline,
  IoPersonOutline,
  IoLogOutOutline,
} from "react-icons/io5";
import { AuthContext } from "../../context/AuthContext";
import { useSettings } from "../../context/SettingsContext";
import { IoIosArrowBack } from "react-icons/io";

function Toggle({ checked, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors cursor-pointer ${
        checked ? "bg-cyan-500" : "bg-surface-2 border border-subtle"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          checked ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}

function SegmentedControl({ options, value, onChange }) {
  return (
    <div className="inline-flex rounded-lg border border-subtle bg-page p-0.5">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors cursor-pointer ${
            value === opt.value ? "bg-cyan-500 text-white" : "text-muted hover:text-ink"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function SettingsRow({ label, description, children, divider = true }) {
  return (
    <div className={`flex items-center justify-between gap-4 py-3 ${divider ? "border-b border-subtle" : ""}`}>
      <div className="min-w-0">
        <p className="text-sm font-medium text-ink">{label}</p>
        {description && <p className="text-xs text-muted mt-0.5">{description}</p>}
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  );
}

// eslint-disable-next-line no-unused-vars -- Icon is only used as a JSX tag below; core no-unused-vars can't see that without eslint-plugin-react's jsx-uses-vars rule, which isn't installed here.
function SettingsSection({ icon: Icon, title, children }) {
  return (
    <div className="bg-surface border border-subtle rounded-2xl p-4 sm:p-5">
      <div className="flex items-center gap-2 mb-1">
        <Icon className="text-cyan-400 text-lg flex-shrink-0" />
        <h2 className="text-base font-semibold text-ink">{title}</h2>
      </div>
      <div>{children}</div>
    </div>
  );
}

export default function SettingsPage() {
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);
  const { settings, updateSetting } = useSettings();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleConfirmLogout = () => {
    // logout() clears every token key and the cached user profile.
    logout();
    setShowLogoutConfirm(false);
    navigate("/auth/login", { replace: true });
  };

  return (
    <div className="bg-page min-h-screen p-4 sm:p-6">
      <div className="max-w-[600px] mx-auto space-y-4">
       <div className="flex items-center mb-4">
  <button
    type="button"
    onClick={() => navigate(-1)}
    aria-label="Go back"
    className="flex items-center justify-center w-9 h-9 rounded-full text-muted hover:text-ink hover:bg-surface-1 transition-colors cursor-pointer"
  >
    <IoIosArrowBack className="text-2xl" />
  </button>
  <h1 className="text-xl font-bold text-ink">Settings</h1>
</div>
        <SettingsSection icon={IoColorPaletteOutline} title="Appearance">
          <SettingsRow label="Theme" description="Switch between light and dark mode">
            <SegmentedControl
              value={settings.theme}
              onChange={(value) => updateSetting("theme", value)}
              options={[
                { value: "light", label: "Light" },
                { value: "dark", label: "Dark" },
              ]}
            />
          </SettingsRow>
          <SettingsRow label="Font size" description="Scales text across the app" divider={false}>
            <SegmentedControl
              value={settings.fontSize}
              onChange={(value) => updateSetting("fontSize", value)}
              options={[
                { value: "small", label: "Small" },
                { value: "medium", label: "Medium" },
                { value: "large", label: "Large" },
              ]}
            />
          </SettingsRow>
        </SettingsSection>

        <SettingsSection icon={IoAppsOutline} title="App preferences">
          <SettingsRow label="Autoplay videos" description="Play videos in the feed automatically">
            <Toggle
              checked={settings.autoplayVideos}
              onChange={(value) => updateSetting("autoplayVideos", value)}
              label="Autoplay videos"
            />
          </SettingsRow>
          <SettingsRow label="Show like counts" description="Hide the number next to Like on posts">
            <Toggle
              checked={settings.showLikeCounts}
              onChange={(value) => updateSetting("showLikeCounts", value)}
              label="Show like counts"
            />
          </SettingsRow>
          {/* Feed order is stored here for later use - there's no
              algorithmic "most relevant" sort implemented yet, so both
              options currently render the feed in the order the API
              returns it (newest first). Wiring this up to real sort logic
              can come once that exists. */}
          <SettingsRow label="Feed order" description="How posts are ordered on your home feed" divider={false}>
            <SegmentedControl
              value={settings.feedOrder}
              onChange={(value) => updateSetting("feedOrder", value)}
              options={[
                { value: "newest", label: "Newest first" },
                { value: "relevant", label: "Most relevant" },
              ]}
            />
          </SettingsRow>
        </SettingsSection>

        <SettingsSection icon={IoNotificationsOutline} title="Notifications">
          <SettingsRow label="Mute notifications" description="Hide the unread badge on the bell icon">
            <Toggle
              checked={settings.muteNotifications}
              onChange={(value) => updateSetting("muteNotifications", value)}
              label="Mute notifications"
            />
          </SettingsRow>
          <SettingsRow label="Notification sound" description="Play a sound for new notifications" divider={false}>
            <Toggle
              checked={settings.notificationSound}
              onChange={(value) => updateSetting("notificationSound", value)}
              label="Notification sound"
            />
          </SettingsRow>
        </SettingsSection>

       <SettingsSection icon={IoPersonOutline} title="Account">
  <SettingsRow 
    label="Log out" 
    description="You'll need to sign in again to come back" 
    divider={false}
  >
    <Button
      onPress={() => setShowLogoutConfirm(true)}
      variant="outline"
className="border border-red-500/40 text-red-500 hover:bg-red-500/10 hover:border-red-500 gap-2 transition-colors"      startContent={<IoLogOutOutline className="text-lg" />}
    >
      Log out
    </Button>
  </SettingsRow>
</SettingsSection>
      </div>

      <Modal isOpen={showLogoutConfirm} onOpenChange={setShowLogoutConfirm} backdrop="blur">
        <ModalContent className="bg-surface text-ink border border-subtle">
          {() => (
            <>
              <ModalHeader className="border-b border-subtle">Log out?</ModalHeader>
              <ModalBody className="py-4">
                <p className="text-muted">Are you sure you want to log out of your account?</p>
              </ModalBody>
              <ModalFooter className="border-t border-subtle">
                <Button onPress={() => setShowLogoutConfirm(false)} className="bg-surface-2 text-ink">
                  Cancel
                </Button>
                <Button onPress={handleConfirmLogout} className="bg-red-600 hover:bg-red-700 text-white">
                  Log Out
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
