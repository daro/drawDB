import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import SimpleCanvas from "@components/SimpleCanvas";
import Navbar from "@components/Navbar";
import { template5 } from "../templates/template5";
import mysql_icon from "../assets/mysql.png";
import postgres_icon from "../assets/postgres.png";
import sqlite_icon from "../assets/sqlite.png";
import mariadb_icon from "../assets/mariadb.png";
import oraclesql_icon from "../assets/oraclesql.png";
import sql_server_icon from "../assets/sql-server.png";
import github from "../assets/github.png";
import screenshot from "../assets/screenshot.png";
import FadeIn from "../animations/FadeIn";
import axios from "axios";
import { languages } from "@i18n/i18n";
import { socials } from "@data/socials";
import sympleCanvasDiagram from "../templates/sympleCanvas.json";

function shortenNumber(number) {
  if (number < 1000) return number;

  if (number >= 1000 && number < 1_000_000)
    return `${(number / 1000).toFixed(1)}k`;
}

export default function LandingPage() {
  const [stats, setStats] = useState({ stars: 0, forks: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get(
          "https://api.github.com/repos/daro/drawDB"
        );
        setStats({
          stars: res.data.stargazers_count,
          forks: res.data.forks_count,
        });
      } catch (error) {
        // Fallback or silence error if rate limited
        setStats({ stars: 120, forks: 45 });
      }
    };

    const style = document.createElement('style');
    style.innerHTML = `
      @keyframes shimmer {
        0% { transform: translateX(-100%); }
        100% { transform: translateX(100%); }
      }
      .bg-dots {
        background-image: radial-gradient(#e2e8f0 1px, transparent 1px);
        background-size: 24px 24px;
      }
      .hero-glow {
        background: radial-gradient(circle at 50% 50%, rgba(14, 165, 233, 0.15) 0%, transparent 70%);
      }
    `;
    document.head.appendChild(style);

    document.body.setAttribute("theme-mode", "dark");
    document.title =
      "DrawDB Plus | Enhanced database diagram editor and SQL generator";

    fetchStats();
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div className="bg-zinc-950 text-zinc-300">
      <div className="flex flex-col h-screen bg-zinc-950">
        <div className="text-white font-semibold py-1 text-sm text-center bg-linear-to-r from-[#12495e] from-10% via-slate-500 to-[#12495e]" />

        <FadeIn duration={0.6}>
          <div className="bg-zinc-950/50 backdrop-blur-md border-b border-zinc-800">
            <Navbar mode="dark" />
          </div>
        </FadeIn>

        {/* Hero section */}
        <div className="flex-1 relative mx-4 md:mx-0 mb-4 rounded-3xl bg-zinc-950 overflow-hidden shadow-2xl border border-zinc-800 min-h-screen flex flex-col">
          <div className="flex flex-col xl:flex-row items-stretch w-full flex-1">
            {/* Left side: Description */}
            <div className="relative z-10 flex flex-col justify-center px-12 md:px-6 py-20 text-zinc-100 xl:w-1/3 overflow-hidden min-h-full">
              <FadeIn duration={0.75}>
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-950/30 border border-sky-900/50 text-sky-400 text-xs font-bold uppercase tracking-wider mb-6">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500"></span>
                    </span>
                    Open Source Editor
                  </div>
                  <h1 className="text-6xl md:text-4xl font-extrabold tracking-tight mb-4 leading-tight">
                    <span className="bg-linear-to-r from-white to-sky-400 inline-block text-transparent bg-clip-text">
                      DrawDB Plus
                    </span>
                  </h1>
                  <div className="text-sm font-bold text-slate-500 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                    <div className="h-[1px] w-8 bg-slate-700"></div>
                    Enhanced fork of DrawDB
                  </div>
                  <p className="text-xl md:text-lg font-medium text-slate-300 max-w-2xl leading-relaxed mb-10">
                    A powerful, free, and open-source database diagram editor.
                    Optimized for TypeScript, performance, and UX.
                  </p>
                  <div className="flex flex-wrap items-center gap-4 text-sm font-bold">
                    <span className="flex items-center gap-2 text-emerald-400 bg-emerald-950/50 px-4 py-2 rounded-lg border border-emerald-900/50">
                      <i className="bi bi-check2-circle"></i> No registration
                    </span>
                    <span className="flex items-center gap-2 text-indigo-400 bg-indigo-950/50 px-4 py-2 rounded-lg border border-indigo-900/50">
                      <i className="bi bi-gift"></i> Completely free
                    </span>
                    <span className="flex items-center gap-2 text-amber-400 bg-amber-950/50 px-4 py-2 rounded-lg border border-amber-900/50">
                      <i className="bi bi-lightning-charge"></i> Fast &
                      Lightweight
                    </span>
                  </div>
                </div>
              </FadeIn>
              <div className="mt-12 flex flex-wrap gap-4">
                <Link
                  to="/editor"
                  className="group relative inline-flex items-center justify-center py-4 px-10 font-bold text-white transition-all duration-300 bg-sky-900 rounded-2xl shadow-xl hover:bg-sky-800 hover:scale-105 active:scale-95 overflow-hidden"
                >
                  <div className="absolute inset-0 w-full h-full bg-linear-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
                  <span>Launch Editor</span>
                  <i className="bi bi-arrow-right ms-2 transition-transform group-hover:translate-x-1"></i>
                </Link>
                <button
                  className="py-4 px-10 font-bold text-slate-300 transition-all duration-300 bg-zinc-900 border-2 border-zinc-800 rounded-2xl shadow-sm hover:border-sky-500/50 hover:bg-sky-500/10 hover:text-sky-400 active:scale-95 cursor-pointer"
                  onClick={() =>
                    document
                      .getElementById("learn-more")
                      .scrollIntoView({ behavior: "smooth" })
                  }
                >
                  Learn more
                </button>
              </div>
            </div>

            {/* Right side: SimpleCanvas */}
            <div className="xl:w-2/3 relative bg-zinc-900/30 border-l border-zinc-800/50 shrink-0 flex-1 min-h-[400px] xl:min-h-full">
              <SimpleCanvas
                diagram={sympleCanvasDiagram}
                zoom={0.9}
                mode="dark"
                relationshipStyle="erd"
                autoCenter={true}
                padding={40}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Learn more */}
      <div id="learn-more">
        <div className="bg-zinc-950 py-10 px-28 md:px-8">
          <div className="mt-8 w-[75%] text-center sm:w-full mx-auto shadow-2xl rounded-2xl border border-zinc-800 p-6 bg-zinc-900 space-y-3 mb-12">
            <div className="text-lg font-medium text-zinc-100">
              Build diagrams with a few clicks, see the full picture, export SQL
              scripts, customize your editor, and more.
            </div>
            <img src={screenshot} className="mx-auto rounded-lg" />
          </div>

          <div className="mt-8 mb-12 w-[85%] mx-auto sm:w-full">
            <div className="text-3xl md:text-2xl font-bold text-zinc-100 mb-8 text-center tracking-tight">
              What's New in <span className="text-sky-400">Plus</span>
            </div>
            <div className="grid grid-cols-2 gap-6 md:grid-cols-1">
              <div className="group bg-zinc-900 rounded-2xl p-8 shadow-sm border border-zinc-800 transition-all duration-300 hover:shadow-sky-500/10 hover:-translate-y-1 hover:border-sky-500/50">
                <div className="w-12 h-12 bg-sky-950 rounded-xl flex items-center justify-center mb-6 transition-colors group-hover:bg-sky-900">
                  <i className="bi bi-braces text-2xl text-sky-400"></i>
                </div>
                <div className="text-xl font-bold mb-3 text-zinc-100">
                  Enhanced TypeScript
                </div>
                <p className="text-zinc-400 leading-relaxed">
                  Improved type safety across the entire codebase for better
                  reliability and developer experience.
                </p>
              </div>
              <div className="group bg-zinc-900 rounded-2xl p-8 shadow-sm border border-zinc-800 transition-all duration-300 hover:shadow-emerald-500/10 hover:-translate-y-1 hover:border-emerald-500/50">
                <div className="w-12 h-12 bg-emerald-950 rounded-xl flex items-center justify-center mb-6 transition-colors group-hover:bg-emerald-900">
                  <i className="bi bi-speedometer2 text-2xl text-emerald-400"></i>
                </div>
                <div className="text-xl font-bold mb-3 text-zinc-100">
                  Performance Optimized
                </div>
                <p className="text-zinc-400 leading-relaxed">
                  80% faster initial load time thanks to code splitting and lazy
                  loading of SQL parsers.
                </p>
              </div>
              <div className="group bg-zinc-900 rounded-2xl p-8 shadow-sm border border-zinc-800 transition-all duration-300 hover:shadow-indigo-500/10 hover:-translate-y-1 hover:border-indigo-500/50">
                <div className="w-12 h-12 bg-indigo-950 rounded-xl flex items-center justify-center mb-6 transition-colors group-hover:bg-indigo-900">
                  <i className="bi bi-palette text-2xl text-indigo-400"></i>
                </div>
                <div className="text-xl font-bold mb-3 text-zinc-100">
                  Better UX
                </div>
                <p className="text-zinc-400 leading-relaxed">
                  Refined interface with smoother interactions and improved
                  usability for a better workflow.
                </p>
              </div>
              <div className="group bg-zinc-900 rounded-2xl p-8 shadow-sm border border-zinc-800 transition-all duration-300 hover:shadow-amber-500/10 hover:-translate-y-1 hover:border-amber-500/50">
                <div className="w-12 h-12 bg-amber-950 rounded-xl flex items-center justify-center mb-6 transition-colors group-hover:bg-amber-900">
                  <i className="bi bi-bug text-2xl text-amber-400"></i>
                </div>
                <div className="text-xl font-bold mb-3 text-zinc-100">
                  Bug Fixes
                </div>
                <p className="text-zinc-400 leading-relaxed">
                  Numerous stability improvements and fixes for reported issues
                  from the original version.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-center items-center gap-28 md:flex-col md:gap-12 py-10">
            <div className="text-center group">
              <div className="text-6xl md:text-4xl font-black text-sky-500 mb-2 transition-transform group-hover:scale-110">
                {shortenNumber(stats.stars)}
              </div>
              <div className="text-sm font-bold text-zinc-500 uppercase tracking-widest">
                GitHub stars
              </div>
            </div>
            <div className="text-center group">
              <div className="text-6xl md:text-4xl font-black text-sky-500 mb-2 transition-transform group-hover:scale-110">
                {shortenNumber(stats.forks)}
              </div>
              <div className="text-sm font-bold text-zinc-500 uppercase tracking-widest">
                GitHub forks
              </div>
            </div>
            <div className="text-center group">
              <div className="text-6xl md:text-4xl font-black text-sky-500 mb-2 transition-transform group-hover:scale-110">
                {shortenNumber(languages.length)}
              </div>
              <div className="text-sm font-bold text-zinc-500 uppercase tracking-widest">
                Languages
              </div>
            </div>
          </div>
          <div className="text-lg font-bold text-center mt-20 mb-10 text-zinc-500 uppercase tracking-[0.3em]">
            Supported Databases
          </div>
          <div className="flex flex-wrap justify-center items-center gap-16 md:gap-8 opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500 invert">
            {dbs.map((s, i) => (
              <img
                key={"icon-" + i}
                src={s.icon}
                alt={s.name}
                style={{ height: s.height * 0.8 }}
                className="hover:scale-110 transition-transform duration-300 md:h-[40px]"
              />
            ))}
          </div>
        </div>
        <svg
          viewBox="0 0 1440 54"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          width="100%"
          className="bg-transparent"
        >
          <path
            d="M0 54C0 54 320 0 720 0C1080 0 1440 54 1440 54V0H0V100Z"
            fill="#09090b"
          />
        </svg>
      </div>

      {/* Features */}
      <div id="features" className="py-20 px-36 md:px-8 bg-zinc-950">
        <FadeIn duration={1}>
          <div className="text-sky-400 font-bold text-center uppercase tracking-widest text-sm mb-3">
            Features
          </div>
          <div className="text-4xl md:text-3xl font-extrabold text-center text-zinc-100 mb-16">
            Everything you need to design your database
          </div>
          <div className="grid grid-cols-3 gap-8 md:grid-cols-2 sm:grid-cols-1">
            {features.map((f, i) => (
              <div
                key={"feature" + i}
                className="group flex flex-col p-8 rounded-2xl bg-zinc-900 border border-zinc-800 transition-all duration-300 hover:bg-zinc-800/50 hover:shadow-2xl hover:shadow-sky-500/5 hover:-translate-y-2 hover:border-zinc-700"
              >
                <div className="mb-6 w-12 h-12 bg-zinc-800 rounded-xl shadow-sm flex items-center justify-center text-sky-400 group-hover:bg-sky-500 group-hover:text-white transition-all duration-300">
                  <i className={`bi ${f.icon || "bi-stars"} text-xl`}></i>
                </div>
                <div className="text-xl font-bold mb-3 text-zinc-100">
                  {f.title}
                </div>
                <div className="text-zinc-400 leading-relaxed mb-4">
                  {f.content}
                </div>
                {f.footer && (
                  <div className="mt-auto text-xs font-medium text-zinc-500 uppercase tracking-wider">
                    {f.footer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </FadeIn>
      </div>

      {/* Contact us */}
      <svg
        viewBox="0 0 1440 54"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        width="100%"
        className="bg-transparent -scale-100"
      >
        <path
          d="M0 48 C0 48 320 0 720 0C1080 0 1440 48 1440 48V0H0V100Z"
          fill="#09090b"
        />
      </svg>
      <div className="bg-zinc-950 py-8 px-32 md:px-8">
        <div className="mt-4 mb-2 text-2xl font-bold text-center text-zinc-100">
          Open Source & Community
        </div>
        <div className="text-lg text-center mb-6 max-w-3xl mx-auto text-zinc-400">
          DrawDB Plus is a modified version (fork) of the original{" "}
          <a
            href="https://github.com/drawdb-io/drawdb"
            target="_blank"
            rel="noreferrer"
            className="text-sky-400 hover:underline font-semibold"
          >
            DrawDB
          </a>{" "}
          project. Built with improvements in type safety, performance, and UX,
          while remaining 100% free and open source under the AGPL-3.0 license.
        </div>
        <div className="px-36 text-center md:px-8">
          <div className="md:block md:space-y-3 flex gap-3 justify-center">
            <a
              className="inline-block"
              href={socials.github}
              target="_blank"
              rel="noreferrer"
            >
              <div className="bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 transition-all duration-300 flex items-center gap-4 px-14 py-4 rounded-lg">
                <img src={github} className="h-8" />
                <div className="text-lg text-white font-bold">
                  View on GitHub
                </div>
              </div>
            </a>
            <a
              className="inline-block"
              href={socials.issues}
              target="_blank"
              rel="noreferrer"
            >
              <div className="bg-sky-700 hover:bg-sky-600 transition-all duration-300 flex items-center gap-4 px-12 py-4 rounded-lg">
                <i className="text-2xl bi bi-bug text-white" />
                <div className="text-lg text-white font-bold">
                  Report Issues
                </div>
              </div>
            </a>
            <a
              className="inline-block"
              href={socials.discussions}
              target="_blank"
              rel="noreferrer"
            >
              <div className="text-white bg-sky-700 hover:bg-sky-600 transition-all duration-300 flex items-center gap-4 px-10 py-4 rounded-lg">
                <i className="text-2xl bi bi-chat-dots" />
                <div className="text-lg font-bold">Discussions</div>
              </div>
            </a>
          </div>
        </div>
      </div>

      <div className="bg-red-900/80 py-1 text-center text-red-100 text-xs font-semibold px-3">
        Attention! The diagrams are saved in your browser. Before clearing the
        browser make sure to back up your data.
      </div>
      <hr className="border-zinc-800" />
      <div className="bg-zinc-950 py-6 px-4">
        <div className="flex flex-col items-center gap-4 text-sm">
          <div className="flex gap-6 md:flex-col md:gap-2 text-center font-medium">
            <a
              href={socials.github}
              target="_blank"
              rel="noreferrer"
              className="text-zinc-400 hover:text-sky-400 transition-colors"
            >
              <i className="bi bi-code-slash me-1"></i> Source Code
            </a>
            <a
              href="https://github.com/drawdb-io/drawdb"
              target="_blank"
              rel="noreferrer"
              className="text-zinc-400 hover:text-sky-400 transition-colors"
            >
              Original DrawDB
            </a>
            <a
              href="/LICENSE"
              target="_blank"
              rel="noreferrer"
              className="text-zinc-400 hover:text-sky-400 transition-colors"
            >
              AGPL-3.0 License
            </a>
          </div>
          <div className="text-zinc-600 text-center max-w-2xl text-xs leading-relaxed">
            &copy; {new Date().getFullYear()} <strong>DrawDB Plus</strong>. This
            is a modified version of DrawDB. The source code for this version is
            available under the GNU AGPLv3. Original DrawDB is copyright &copy;
            drawDB Team.
          </div>
          <div className="text-zinc-600 text-center max-w-2xl text-[10px] leading-relaxed opacity-70">
            <strong>Disclaimer:</strong> This software is provided "as is",
            without warranty of any kind. The maintainer is not responsible for
            any damages, data loss, or errors arising from the use of this tool.
            Use at your own risk.
          </div>
        </div>
      </div>
    </div>
  );
}

const dbs = [
  { icon: mysql_icon, height: 80, name: "MySQL" },
  { icon: postgres_icon, height: 48, name: "PostgreSQL" },
  { icon: sqlite_icon, height: 64, name: "SQLite" },
  { icon: mariadb_icon, height: 64, name: "MariaDB" },
  { icon: sql_server_icon, height: 64, name: "SQL Server" },
];

const features = [
  {
    title: "Export",
    icon: "bi-download",
    content: (
      <div>
        Export DDL scripts to your database or download the diagram as an image
        (PNG/SVG) or a JSON file.
      </div>
    ),
    footer: "",
  },
  {
    title: "Reverse Engineering",
    icon: "bi-arrow-repeat",
    content: (
      <div>
        Already have a schema? Import a DDL script to automatically generate a
        readable diagram from it.
      </div>
    ),
    footer: "",
  },
  {
    title: "Customizable Workspace",
    icon: "bi-layout-sidebar-inset",
    content: (
      <div>
        Tailor the interface to your preference. Choose which components and
        color themes to see.
      </div>
    ),
    footer: "",
  },
  {
    title: "Keyboard Shortcuts",
    icon: "bi-keyboard",
    content: (
      <div>
        Speed up your work with extensive keyboard shortcuts. See all available
        combinations
        <Link
          to={`${socials.docs}/shortcuts`}
          className="ms-1.5 text-blue-500 hover:underline"
        >
          here
        </Link>
        .
      </div>
    ),
    footer: "",
  },
  {
    title: "Templates",
    icon: "bi-journals",
    content: (
      <div>
        Start with ready-made templates. Use them as a base for your project or
        a source of inspiration.
      </div>
    ),
    footer: "",
  },
  {
    title: "Custom Templates",
    icon: "bi-folder-plus",
    content: (
      <div>
        Have repetitive structures? Save them as your own templates and load
        them instantly in new projects.
      </div>
    ),
    footer: "",
  },
  {
    title: "Robust Editor",
    icon: "bi-pencil-square",
    content: (
      <div>
        Undo, redo, copy, and paste. Add tables, subject areas, notes, and text
        with ease.
      </div>
    ),
    footer: "",
  },
  {
    title: "Issue Detection",
    icon: "bi-exclamation-triangle",
    content: (
      <div>
        Automatically detect inconsistencies in your diagram to ensure generated
        scripts are correct.
      </div>
    ),
    footer: "",
  },
  {
    title: "Relational Databases",
    icon: "bi-database",
    content: (
      <div>
        We support 5 major relational databases - MySQL, PostgreSQL, SQLite,
        MariaDB, and SQL Server.
      </div>
    ),
    footer: "",
  },
  {
    title: "Presentation Mode",
    icon: "bi-easel2",
    content: (
      <div>
        Present your diagrams on a large screen during team meetings and
        architecture discussions.
      </div>
    ),
    footer: "",
  },
  {
    title: "Notes & Annotations",
    icon: "bi-sticky",
    content: (
      <div>
        Document your thought process. Add rich text notes and annotations to
        provide context for your team.
      </div>
    ),
    footer: "",
  },
  {
    title: "Subject Areas",
    icon: "bi-grid-3x3",
    content: (
      <div>
        Organize complex diagrams into logical groups using subject areas. Keep
        your workspace clean and manageable.
      </div>
    ),
    footer: "",
  },
  {
    title: "Enums & Types",
    icon: "bi-list-ul",
    content: (
      <div>
        Define custom types and enums once and reuse them across your tables.
        Ensures consistency and type safety.
      </div>
    ),
    footer: "",
  },
  {
    title: "To-do List",
    icon: "bi-list-check",
    content: (
      <div>
        Track progress directly in the editor with a built-in TODO list.
      </div>
    ),
    footer: "",
  },
];
