import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { SignIn, SignUp, useAuth } from "@clerk/clerk-react";
import "./LoginPage.css";

type Theme = {
  bg: string;
  shapeA: string;
  shapeB: string;
  shapeBorder: string;
  shapeOpacity: number[];
  blob: string;
  blobOpacity: number;
  appName: string;
  appNameAccent: string;
  tagline: string;
  decorLine: string;
  subText: string;
  dotActive: string;
  dotInactive: string;
  logoColor: string;
  card: string;
  cardBorder: string;
  cardShadow: string;
  cardTitle: string;
  cardSub: string;
  label: string;
  inputBg: string;
  inputBorder: string;
  inputBorderFocus: string;
  inputShadowFocus: string;
  inputIcon: string;
  inputColor: string;
  toggleColor: string;
  forgotLink: string;
  signInBg: string;
  signInColor: string;
  signInBorder: string;
  signInHoverBg: string;
  signInHoverColor: string;
  signInShadow: string;
  signInHoverShadow: string;
  dividerLine: string;
  dividerText: string;
  oauthBg: string;
  oauthBorder: string;
  oauthColor: string;
  oauthHoverBg: string;
  oauthHoverBorder: string;
  signupText: string;
  signupLink: string;
  toggleBtnBg: string;
  toggleBtnBorder: string;
  toggleBtnColor: string;
  toggleBtnHoverBg: string;
};

const SHAPES = [
  { width: 460, height: 670, br: "60% 40% 70% 30% / 50% 60% 40% 50%", delay: 0 },
  { width: 620, height: 820, br: "50% 50% 60% 40% / 40% 50% 50% 60%", delay: 0.15 },
  { width: 800, height: 980, br: "40% 60% 50% 50% / 60% 40% 60% 40%", delay: 0.3 },
  { width: 980, height: 1140, br: "55% 45% 45% 55% / 45% 55% 45% 55%", delay: 0.45 },
  { width: 1160, height: 1320, br: "45% 55% 55% 45% / 55% 45% 55% 45%", delay: 0.6 },
] as const;

const ROTATING_LINES = [
  {
    line1: "Learn smarter, not harder",
    line2: "with AI guidance",
  },
  {
    line1: "Turn videos into structured,",
    line2: "interactive learning",
  },
  {
    line1: "From watching to mastering,",
    line2: "step by step",
  },
] as const;

const DARK: Theme = {
  bg: "#171717",
  shapeA: "linear-gradient(135deg,#e8e8e8 0%,#aaaaaa 100%)",
  shapeB: "linear-gradient(135deg,#ffffff 0%,#cccccc 100%)",
  shapeBorder: "rgba(255,255,255,0.18)",
  shapeOpacity: [0.13, 0.1, 0.08, 0.06, 0.045],
  blob: "radial-gradient(circle,rgba(220,220,220,0.5) 0%,transparent 70%)",
  blobOpacity: 0.22,
  appName: "rgba(255,255,255,0.78)",
  appNameAccent: "rgba(255,255,255,0.55)",
  tagline: "rgba(255,255,255,0.45)",
  decorLine: "linear-gradient(90deg,rgba(255,255,255,0.6),transparent)",
  subText: "rgba(255,255,255,0.28)",
  dotActive: "#ffffff",
  dotInactive: "rgba(255,255,255,0.22)",
  logoColor: "rgba(255,255,255,0.65)",
  card: "rgba(18,18,18,0.78)",
  cardBorder: "rgba(255,255,255,0.09)",
  cardShadow: "0 32px 80px rgba(0,0,0,0.55),inset 0 1px 0 rgba(255,255,255,0.07)",
  cardTitle: "#ffffff",
  cardSub: "rgba(255,255,255,0.38)",
  label: "rgba(255,255,255,0.48)",
  inputBg: "rgba(255,255,255,0.04)",
  inputBorder: "rgba(255,255,255,0.1)",
  inputBorderFocus: "rgba(255,255,255,0.35)",
  inputShadowFocus: "rgba(255,255,255,0.04)",
  inputIcon: "rgba(255,255,255,0.28)",
  inputColor: "#ffffff",
  toggleColor: "rgba(255,255,255,0.28)",
  forgotLink: "rgba(255,255,255,0.35)",
  signInBg: "#1a1a1a",
  signInColor: "#ffffff",
  signInBorder: "rgba(255,255,255,0.15)",
  signInHoverBg: "#ffffff",
  signInHoverColor: "#111111",
  signInShadow: "rgba(0,0,0,0.3)",
  signInHoverShadow: "rgba(0,0,0,0.45)",
  dividerLine: "rgba(255,255,255,0.08)",
  dividerText: "rgba(255,255,255,0.28)",
  oauthBg: "rgba(255,255,255,0.04)",
  oauthBorder: "rgba(255,255,255,0.1)",
  oauthColor: "rgba(255,255,255,0.68)",
  oauthHoverBg: "rgba(255,255,255,0.1)",
  oauthHoverBorder: "rgba(255,255,255,0.28)",
  signupText: "rgba(255,255,255,0.3)",
  signupLink: "rgba(255,255,255,0.72)",
  toggleBtnBg: "rgba(255,255,255,0.08)",
  toggleBtnBorder: "rgba(255,255,255,0.14)",
  toggleBtnColor: "rgba(255,255,255,0.68)",
  toggleBtnHoverBg: "rgba(255,255,255,0.14)",
};

const LIGHT: Theme = {
  bg: "#d9d5cf",
  shapeA: "linear-gradient(135deg,#222222 0%,#555555 100%)",
  shapeB: "linear-gradient(135deg,#0a0a0a 0%,#3a3a3a 100%)",
  shapeBorder: "rgba(0,0,0,0.10)",
  shapeOpacity: [0.09, 0.07, 0.055, 0.04, 0.028],
  blob: "radial-gradient(circle,rgba(50,50,50,0.28) 0%,transparent 70%)",
  blobOpacity: 0.16,
  appName: "rgba(17,17,17,0.74)",
  appNameAccent: "rgba(17,17,17,0.52)",
  tagline: "rgba(0,0,0,0.46)",
  decorLine: "linear-gradient(90deg,rgba(0,0,0,0.5),transparent)",
  subText: "rgba(0,0,0,0.3)",
  dotActive: "#111111",
  dotInactive: "rgba(0,0,0,0.2)",
  logoColor: "rgba(0,0,0,0.5)",
  card: "rgba(250,248,244,0.72)",
  cardBorder: "rgba(0,0,0,0.08)",
  cardShadow: "0 32px 80px rgba(0,0,0,0.10),inset 0 1px 0 rgba(255,255,255,0.95)",
  cardTitle: "#111111",
  cardSub: "rgba(0,0,0,0.42)",
  label: "rgba(0,0,0,0.48)",
  inputBg: "rgba(0,0,0,0.04)",
  inputBorder: "rgba(0,0,0,0.12)",
  inputBorderFocus: "rgba(0,0,0,0.4)",
  inputShadowFocus: "rgba(0,0,0,0.05)",
  inputIcon: "rgba(0,0,0,0.3)",
  inputColor: "#111111",
  toggleColor: "rgba(0,0,0,0.3)",
  forgotLink: "rgba(0,0,0,0.38)",
  signInBg: "#111111",
  signInColor: "#ffffff",
  signInBorder: "rgba(0,0,0,0.18)",
  signInHoverBg: "#333333",
  signInHoverColor: "#ffffff",
  signInShadow: "rgba(0,0,0,0.1)",
  signInHoverShadow: "rgba(0,0,0,0.18)",
  dividerLine: "rgba(0,0,0,0.10)",
  dividerText: "rgba(0,0,0,0.32)",
  oauthBg: "rgba(0,0,0,0.04)",
  oauthBorder: "rgba(0,0,0,0.10)",
  oauthColor: "rgba(0,0,0,0.62)",
  oauthHoverBg: "rgba(0,0,0,0.08)",
  oauthHoverBorder: "rgba(0,0,0,0.22)",
  signupText: "rgba(0,0,0,0.38)",
  signupLink: "rgba(0,0,0,0.72)",
  toggleBtnBg: "rgba(0,0,0,0.07)",
  toggleBtnBorder: "rgba(0,0,0,0.13)",
  toggleBtnColor: "rgba(0,0,0,0.58)",
  toggleBtnHoverBg: "rgba(0,0,0,0.13)",
};

const BrandLogo = ({ c }: { c?: string }) => <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke={c || "currentColor"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 6.5C10.1 5.35 7.4 4.8 4.2 4.8c-.55 0-1 .45-1 1v11.4c0 .55.45 1 1 1 3.15 0 5.9.58 7.8 1.75" /><path d="M12 6.5c1.9-1.15 4.65-1.7 7.8-1.7.55 0 1 .45 1 1v11.4c0 .55-.45 1-1 1-3.15 0-5.9.58-7.8 1.75" /><line x1="12" y1="6.5" x2="12" y2="19.95" /></svg>;

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoaded, isSignedIn } = useAuth();
  const isSignUpRoute = location.pathname === "/sign-up";
  const [isDark, setIsDark] = useState(() => {
    if (typeof window === "undefined" || !window.matchMedia) return true;
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });
  const [mounted, setMounted] = useState(false);
  const [activeLine, setActiveLine] = useState(0);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const shapeRefs = useRef<(HTMLDivElement | null)[]>([]);
  const blobRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const targetRef = useRef({ x: 0, y: 0 });
  const currentRef = useRef({ x: 0, y: 0 });

  const theme = isDark ? DARK : LIGHT;

  const rootVars = useMemo(
    () =>
      ({
        "--lp-bg": theme.bg,
        "--lp-shape-a": theme.shapeA,
        "--lp-shape-b": theme.shapeB,
        "--lp-shape-border": theme.shapeBorder,
        "--lp-blob": theme.blob,
        "--lp-blob-opacity": String(theme.blobOpacity),
        "--lp-app-name": theme.appName,
        "--lp-app-accent": theme.appNameAccent,
        "--lp-tagline": theme.tagline,
        "--lp-decor-line": theme.decorLine,
        "--lp-sub-text": theme.subText,
        "--lp-dot-active": theme.dotActive,
        "--lp-dot-inactive": theme.dotInactive,
        "--lp-logo": theme.logoColor,
        "--lp-card": theme.card,
        "--lp-card-border": theme.cardBorder,
        "--lp-card-shadow": theme.cardShadow,
        "--lp-card-title": theme.cardTitle,
        "--lp-card-sub": theme.cardSub,
        "--lp-label": theme.label,
        "--lp-input-bg": theme.inputBg,
        "--lp-input-border": theme.inputBorder,
        "--lp-input-border-focus": theme.inputBorderFocus,
        "--lp-input-shadow-focus": theme.inputShadowFocus,
        "--lp-input-icon": theme.inputIcon,
        "--lp-input-color": theme.inputColor,
        "--lp-toggle-color": theme.toggleColor,
        "--lp-forgot": theme.forgotLink,
        "--lp-signin-bg": theme.signInBg,
        "--lp-signin-color": theme.signInColor,
        "--lp-signin-border": theme.signInBorder,
        "--lp-signin-hover-bg": theme.signInHoverBg,
        "--lp-signin-hover-color": theme.signInHoverColor,
        "--lp-signin-shadow": theme.signInShadow,
        "--lp-signin-hover-shadow": theme.signInHoverShadow,
        "--lp-divider": theme.dividerLine,
        "--lp-divider-text": theme.dividerText,
        "--lp-oauth-bg": theme.oauthBg,
        "--lp-oauth-border": theme.oauthBorder,
        "--lp-oauth-color": theme.oauthColor,
        "--lp-oauth-hover-bg": theme.oauthHoverBg,
        "--lp-oauth-hover-border": theme.oauthHoverBorder,
        "--lp-signup-text": theme.signupText,
        "--lp-signup-link": theme.signupLink,
        "--lp-toggle-btn-bg": theme.toggleBtnBg,
        "--lp-toggle-btn-border": theme.toggleBtnBorder,
        "--lp-toggle-btn-color": theme.toggleBtnColor,
        "--lp-toggle-btn-hover-bg": theme.toggleBtnHoverBg,
      }) as CSSProperties,
    [theme],
  );

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      navigate("/dashboard", { replace: true });
    }
  }, [isLoaded, isSignedIn, navigate]);

  useEffect(() => {
    const mountTimer = window.setTimeout(() => setMounted(true), 60);
    const media = window.matchMedia("(prefers-color-scheme: dark)");

    const onSchemeChange = (event: MediaQueryListEvent) => {
      setIsDark(event.matches);
    };

    if (media.addEventListener) {
      media.addEventListener("change", onSchemeChange);
    } else {
      media.addListener(onSchemeChange);
    }

    const updateTarget = (clientX: number, clientY: number) => {
      const box = containerRef.current?.getBoundingClientRect();
      if (!box) return;
      targetRef.current = {
        x: ((clientX - box.left) / box.width - 0.5) * 2,
        y: ((clientY - box.top) / box.height - 0.5) * 2,
      };
    };

    const onMove = (event: MouseEvent) => {
      updateTarget(event.clientX, event.clientY);
    };

    const onLeave = () => {
      targetRef.current = { x: 0, y: 0 };
    };

    const animate = () => {
      const current = currentRef.current;
      const target = targetRef.current;
      current.x += (target.x - current.x) * 0.12;
      current.y += (target.y - current.y) * 0.12;

      for (let i = 0; i < SHAPES.length; i += 1) {
        const shape = SHAPES[i];
        const node = shapeRefs.current[i];
        if (!node) continue;
        const tx = -shape.width * 0.34 + current.x * (10 + i * 4);
        const ty = shape.height * 0.34 + current.y * (8 + i * 2.3);
        node.style.transform = `translate(${tx}px, ${ty}px)`;
      }

      if (blobRef.current) {
        const bx = -40 + current.x * 30;
        const by = current.y * 25;
        blobRef.current.style.transform = `translate(${bx}px, ${by}px)`;
      }

      rafRef.current = window.requestAnimationFrame(animate);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mouseleave", onLeave);
    rafRef.current = window.requestAnimationFrame(animate);

    return () => {
      window.clearTimeout(mountTimer);
      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current);
      }
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseleave", onLeave);
      if (media.removeEventListener) {
        media.removeEventListener("change", onSchemeChange);
      } else {
        media.removeListener(onSchemeChange);
      }
    };
  }, []);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setActiveLine((prev) => (prev + 1) % ROTATING_LINES.length);
    }, 2800);

    return () => window.clearInterval(intervalId);
  }, []);

  return (
    <div
      ref={containerRef}
      className={`login-page ${mounted ? "is-mounted" : ""}`}
      style={rootVars}
    >
      <svg className="login-grain" width="100%" height="100%">
        <filter id="login-grain-filter">
          <feTurbulence type="fractalNoise" baseFrequency="0.55" numOctaves="2" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#login-grain-filter)" opacity="0.02" />
      </svg>

      <div className="login-bg-layer" aria-hidden>
        {SHAPES.map((shape, index) => (
          <div
            key={`${shape.width}-${shape.height}`}
            ref={(node) => {
              shapeRefs.current[index] = node;
            }}
            className="login-shape"
            style={
              {
                "--w": `${shape.width}px`,
                "--h": `${shape.height}px`,
                "--br": shape.br,
                "--delay": `${shape.delay}s`,
                "--shape-opacity": String(theme.shapeOpacity[index]),
                "--blur": `${index * 2}px`,
                "--bg": index % 2 === 0 ? theme.shapeA : theme.shapeB,
              } as CSSProperties
            }
          />
        ))}
        <div ref={blobRef} className="login-blob" />
      </div>

      <section className="login-left">
        <div className="login-brand-row">
          <BrandLogo c={theme.logoColor} />
        </div>

        <div>
          <h1 className="login-title">
            Chad <span className="login-title-accent">Tutor</span>
          </h1>
          <p className="login-tagline">
            Go beyond everything.
          </p>
        </div>

        <div className="login-decor" />

        <div className="login-rotator" aria-live="polite">
          {ROTATING_LINES.map((line, index) => (
            <p key={line.line1} className={`login-rotator-line ${activeLine === index ? "is-active" : ""}`}>
              <span className="login-rotator-line-part">{line.line1}</span>
              <span className="login-rotator-line-part">{line.line2}</span>
            </p>
          ))}
        </div>

        <div className="login-dots" aria-hidden>
          {ROTATING_LINES.map((line, index) => (
            <span key={line.line1} className={`login-dot ${activeLine === index ? "is-active" : ""}`} />
          ))}
        </div>
      </section>

      <section className="login-right">
        <div className="login-card">
          <div className="login-card-header">
            <h2 className="login-card-title">{isSignUpRoute ? "Create account" : "Welcome back"}</h2>
            <p className="login-card-sub">
              {isSignUpRoute ? "Sign up to start your learning" : "Sign in to your account"}
            </p>
            <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
              <button
                type="button"
                onClick={() => navigate("/", { replace: true })}
                style={{
                  border: "1px solid rgba(255,255,255,0.2)",
                  background: isSignUpRoute ? "transparent" : "rgba(255,255,255,0.12)",
                  color: "inherit",
                  padding: "6px 10px",
                  borderRadius: 8,
                  fontSize: 12,
                  cursor: "pointer",
                }}
              >
                Sign in
              </button>
              <button
                type="button"
                onClick={() => navigate("/sign-up", { replace: true })}
                style={{
                  border: "1px solid rgba(255,255,255,0.2)",
                  background: isSignUpRoute ? "rgba(255,255,255,0.12)" : "transparent",
                  color: "inherit",
                  padding: "6px 10px",
                  borderRadius: 8,
                  fontSize: 12,
                  cursor: "pointer",
                }}
              >
                Sign up
              </button>
            </div>
          </div>

          <div className="login-clerk-wrap">
            {isSignUpRoute ? (
              <SignUp
                path="/sign-up"
                routing="path"
                forceRedirectUrl="/dashboard"
                signInUrl="/"
                appearance={{
                  elements: {
                    rootBox: "login-clerk-root",
                    card: "login-clerk-card",
                    header: "login-clerk-header",
                    socialButtonsBlockButton: "login-clerk-social-button",
                    dividerLine: "login-clerk-divider-line",
                    dividerText: "login-clerk-divider-text",
                    formFieldInput: "login-clerk-input",
                    formButtonPrimary: "login-clerk-primary-btn",
                    footerActionLink: "login-clerk-link",
                    formFieldLabel: "login-clerk-label",
                    identityPreviewText: "login-clerk-text",
                    formFieldSuccessText: "login-clerk-text",
                    formFieldWarningText: "login-clerk-text",
                    formFieldErrorText: "login-clerk-text",
                    footer: "login-clerk-footer",
                  },
                }}
              />
            ) : (
              <SignIn
                path="/"
                routing="path"
                forceRedirectUrl="/dashboard"
                signUpUrl="/sign-up"
                appearance={{
                  elements: {
                    rootBox: "login-clerk-root",
                    card: "login-clerk-card",
                    header: "login-clerk-header",
                    socialButtonsBlockButton: "login-clerk-social-button",
                    dividerLine: "login-clerk-divider-line",
                    dividerText: "login-clerk-divider-text",
                    formFieldInput: "login-clerk-input",
                    formButtonPrimary: "login-clerk-primary-btn",
                    footerActionLink: "login-clerk-link",
                    formFieldLabel: "login-clerk-label",
                    identityPreviewText: "login-clerk-text",
                    formFieldSuccessText: "login-clerk-text",
                    formFieldWarningText: "login-clerk-text",
                    formFieldErrorText: "login-clerk-text",
                    footer: "login-clerk-footer",
                  },
                }}
              />
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
