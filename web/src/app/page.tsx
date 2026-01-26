import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen bg-base-200 flex flex-col items-center py-8">
      <div className="w-full max-w-3xl bg-base-100 shadow-xl rounded-xl p-8">
        <h1 className="text-2xl font-bold mb-6 text-primary">Cotação de Veículos</h1>
        {/* Formulário de cotação e tabela CRUD serão implementados aqui */}
        <div className="alert alert-info mb-4">
          <span>Interface inicial pronta para CRUD de cotações.</span>
        </div>
      </div>
    </div>
              alt="Vercel logomark"
              width={16}
              height={16}
            />
            Deploy Now
          </a>
          <a
            className="flex h-12 w-full items-center justify-center rounded-full border border-solid border-black/[.08] px-5 transition-colors hover:border-transparent hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-[#1a1a1a] md:w-[158px]"
            href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            Documentation
          </a>
        </div>
      </main>
    </div>
  );
}
