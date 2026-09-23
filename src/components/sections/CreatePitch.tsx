import { Video, FileText, Users, MessageSquare, Settings, Lightbulb } from 'lucide-react';
import { Container } from '@/components/layout/Container';
import { Button } from '@/components/ui/Button';
import { IconCircle } from '@/components/ui/IconCircle';
import { BrowserFrame } from '@/components/media/BrowserFrame';
import { VideoTile } from '@/components/media/VideoTile';
import { Logo } from '@/components/ui/Logo';
import { CREATE_PITCH } from '@/content/copy';

interface CreatePitchProps {
  onOpenDemo: () => void;
}

export function CreatePitch({ onOpenDemo }: CreatePitchProps) {
  return (
    <section id="how-it-works" className="cv-auto relative overflow-hidden surface-light surface-light--mist seam-hairline py-[56px] lg:py-24 on-light">
      <Container className="relative z-10">
        {/* Editorial header: headline left, lead + tip right */}
        <div className="grid gap-7 lg:grid-cols-12 lg:gap-12 items-end mb-9 lg:mb-12">
          <div className="lg:col-span-6">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-[20px] font-bold text-navy-500">{CREATE_PITCH.eyebrow}</span>
              <span className="t-eyebrow text-light-muted">
                {CREATE_PITCH.eyebrowLabel}
              </span>
            </div>
            <h2 className="t-section text-ink">
              <span className="block">{CREATE_PITCH.headline1}</span>
              <span className="block">{CREATE_PITCH.headline2}</span>
            </h2>
          </div>
          <div className="lg:col-span-6 lg:pb-1">
            <p className="lead text-light-muted mb-6">{CREATE_PITCH.lead}</p>
            <div className="h-1 w-10 bg-brand-500 rounded-full mb-5" />
            <div className="flex items-start gap-3">
              <IconCircle size={42} variant="mint">
                <Lightbulb size={20} className="text-brand-700" />
              </IconCircle>
              <p className="text-sm text-light-muted leading-relaxed pt-2">{CREATE_PITCH.tip}</p>
            </div>
          </div>
        </div>
      </Container>

      {/* Product band: the browser breaks out wider than the text column */}
      <div className="relative z-10 mx-auto w-full max-w-[1280px] px-5 sm:px-8 lg:px-10">
        <BrowserFrame>
              <div className="flex min-h-[380px]">
                {/* Sidebar */}
                <div className="hidden sm:flex w-[150px] flex-col border-r border-[#DAE4EB] bg-[#FAFCFD] p-3 gap-1">
                  <div className="px-2 py-1.5 mb-3">
                    <Logo size={16} className="text-ink" />
                  </div>
                  {[
                    { icon: Video, label: 'Create pitch', active: true },
                    { icon: FileText, label: 'My pitches' },
                    { icon: Users, label: 'Discover' },
                    { icon: MessageSquare, label: 'Messages' },
                    { icon: Settings, label: 'Settings' },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className={`flex items-center gap-2 px-2 py-2 rounded-lg text-xs ${
                        item.active
                          ? 'bg-sand-100 text-brand-700 font-bold'
                          : 'text-light-muted hover:bg-gray-50'
                      }`}
                    >
                      <item.icon size={14} />
                      {item.label}
                    </div>
                  ))}
                </div>

                {/* Main content */}
                <div className="flex-1 p-5">
                  <h3 className="text-xl font-bold text-ink mb-1">{CREATE_PITCH.formTitle}</h3>
                  <p className="text-xs text-light-muted mb-4">{CREATE_PITCH.formSub}</p>

                  <div className="flex flex-col sm:flex-row gap-4">
                    {/* Video tile */}
                    <div className="sm:w-[45%]">
                      <VideoTile
                        label={CREATE_PITCH.videoLabel}
                        image="/images/create-pitch.webp"
                        className="w-full"
                        aspectRatio="16/10"
                      />
                    </div>

                    {/* Fields */}
                    <div className="flex-1 space-y-2.5">
                      {CREATE_PITCH.fields.map((field) => (
                        <dl
                          key={field.label}
                          className="rounded-lg border border-[#DAE4EB] p-2.5"
                        >
                          <dt className="text-[10px] text-light-muted uppercase tracking-wider mb-0.5">
                            {field.label}
                          </dt>
                          <dd className="text-[13px] text-ink">{field.value}</dd>
                        </dl>
                      ))}
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-3 mt-4">
                    <Button variant="primary" size="sm" showArrow onClick={onOpenDemo}>
                      {CREATE_PITCH.previewCta}
                    </Button>
                    <Button variant="ghost" size="sm">
                      {CREATE_PITCH.saveCta}
                    </Button>
                  </div>
                </div>
              </div>
        </BrowserFrame>
      </div>
    </section>
  );
}
