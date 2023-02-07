import type { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Toaster, toast } from "react-hot-toast";
import Footer from "../components/Footer";
import Header from "../components/Header";
import LoadingDots from "../components/LoadingDots";
import SquigglyLines from "../components/SquigglyLines";

export const Home: NextPage = () => {
  const router = useRouter();
  const urlState = router.query.slug;
  const [summary, setSummary] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [curArticle, setCurArticle] = useState<string>("");

  console.log({ summary });

  useEffect(() => {
    if (
      urlState &&
      router.isReady &&
      typeof urlState !== "string" &&
      urlState.every((subslug: string) => typeof subslug === "string")
    ) {
      generateSummary(
        "https://techcrunch.com/" + (urlState as string[]).join("/")
      );
    }
  }, [router.isReady, urlState]);

  const curUrl = String(curArticle.split(".com")[1]);

  const generateSummary = async (url?: string) => {
    setSummary("");
    console.log({ url });
    if (url) {
      if (!url.includes("techcrunch.com")) {
        toast.error("Please enter a valid TechCrunch article");
        return;
      }
      setCurArticle(url);
    } else {
      if (!curArticle.includes("techcrunch.com")) {
        toast.error("Please enter a valid TechCrunch article");
        return;
      }
      router.replace(curUrl);
    }
    setLoading(true);
    const response = await fetch("/api/summarize", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url: url ? url : curArticle }),
    });

    if (!response.ok) {
      console.log("error", response.statusText);
      return;
    }

    const data = response.body;
    if (!data) {
      return;
    }

    const reader = data.getReader();
    const decoder = new TextDecoder();
    let done = false;

    while (!done) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;
      const chunkValue = decoder.decode(value);
      setSummary((prev) => prev + chunkValue);
    }
    setLoading(false);
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-5xl flex-col pt-8 sm:pt-12">
      <Head>
        <title>TechCrunch Summarizer</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header />
      <main className="mx-auto mt-10 flex max-w-5xl flex-1 flex-col items-center justify-center px-2 sm:mt-40">
        <h1 className="max-w-5xl text-center text-4xl font-bold sm:text-7xl">
          Summarize any{" "}
          <span className="relative whitespace-nowrap text-[#3290EE]">
            <SquigglyLines />
            <span className="relative text-green-500">TechCrunch</span>
          </span>{" "}
          article in seconds
        </h1>
        <p className="mt-10 text-center text-lg text-gray-500 sm:text-2xl">
          Copy and paste any <span className="text-green-500">TechCrunch </span>
          article below.
        </p>
        <input
          type="text"
          value={curArticle}
          onChange={(e) => setCurArticle(e.target.value)}
          className="mx-auto mt-10 w-full rounded-lg border border-gray-500 bg-black p-3 outline-1 outline-white sm:mt-7 sm:w-3/4"
          // placeholder="https://techcrunch.com/2023/01/31/google-fi-customer-data-breach"
        />
        {!loading && (
          <button
            type="submit"
            className="z-10 mx-auto mt-7 w-3/4 rounded-2xl border-gray-500 bg-green-500 p-3 text-lg font-medium transition hover:bg-green-400 sm:mt-10 sm:w-1/3"
            onClick={() => generateSummary()}
          >
            Summarize
          </button>
        )}
        {loading && (
          <button
            className="z-10 mx-auto mt-7 w-1/3 cursor-not-allowed rounded-2xl border-gray-500 bg-green-500 p-3 text-lg font-medium transition hover:bg-green-400 sm:mt-10"
            disabled
          >
            <LoadingDots />
          </button>
        )}
        <Toaster
          position="top-center"
          reverseOrder={false}
          toastOptions={{ duration: 2000 }}
        />
        {summary && (
          <div className="mb-10 px-4">
            <h2 className="mt-12 text-center text-3xl font-bold sm:text-5xl">
              Summary
            </h2>
            <div className="mx-auto mt-6 max-w-3xl text-lg leading-7">
              {summary.split(". ").map((sentence, index) => (
                <div key={index}>
                  {sentence.length > 0 && (
                    <li className="mb-2 list-disc">{sentence}</li>
                  )}
                </div>
              ))}
              {!loading && (
                <div className="text-md mx-auto flex items-center justify-center space-x-3">
                  <button
                    className="align-center hover:bg-grey-200 z-10 mx-auto mt-10 flex max-w-fit justify-center rounded-2xl border-gray-500 bg-white p-3 text-lg font-semibold text-black transition"
                    onClick={() => {
                      navigator.clipboard.writeText(
                        "https://techcrunchsummary.com/" +
                          (urlState as string[]).join("/")
                      );
                      toast("Link copied to clipboard", {
                        icon: "🔗",
                      });
                    }}
                  >
                    Share Summary Link
                  </button>
                  <button
                    className="align-center hover:bg-grey-200 z-10 mx-auto mt-10 flex max-w-fit justify-center rounded-2xl border-gray-500 bg-white p-3 text-lg font-semibold text-black transition"
                    onClick={() => {
                      navigator.clipboard.writeText(summary);
                      toast("Summary copied to clipboard", {
                        icon: "✂️",
                      });
                    }}
                  >
                    Copy Summary
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Home;
