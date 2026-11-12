import { NewsSlide, AvatarSettings, BroadcastSettings, CreditsSettings } from '../types/news';
import { lipSyncEngine } from './audioLipSync';
import { AVATAR_PROFILES } from '../data/stockAssets';

export class CanvasBroadcastRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private isRunning = false;
  private animId: number | null = null;
  private startTime = 0;

  // Cached assets
  private pipImageCache = new Map<string, HTMLImageElement>();

  constructor() {
    this.canvas = document.createElement('canvas');
    this.canvas.width = 1280;
    this.canvas.height = 720;
    this.ctx = this.canvas.getContext('2d')!;
  }

  public getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }

  public start(
    getCurrentSlide: () => NewsSlide,
    getAvatarSettings: () => AvatarSettings,
    getBroadcastSettings: () => BroadcastSettings,
    getCreditsSettings: () => CreditsSettings,
    getShowCredits: () => boolean
  ) {
    this.isRunning = true;
    this.startTime = performance.now();

    const loop = (time: number) => {
      if (!this.isRunning) return;

      const slide = getCurrentSlide();
      const avatar = getAvatarSettings();
      const broadcast = getBroadcastSettings();
      const credits = getCreditsSettings();
      const showCredits = getShowCredits();

      this.renderFrame(time, slide, avatar, broadcast, credits, showCredits);

      this.animId = requestAnimationFrame(loop);
    };

    this.animId = requestAnimationFrame(loop);
  }

  public stop() {
    this.isRunning = false;
    if (this.animId) {
      cancelAnimationFrame(this.animId);
      this.animId = null;
    }
  }

  private renderFrame(
    time: number,
    slide: NewsSlide,
    avatar: AvatarSettings,
    broadcast: BroadcastSettings,
    credits: CreditsSettings,
    showCredits: boolean
  ) {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    const elapsedSec = (time - this.startTime) / 1000;

    // 1. CLEAR & BACKGROUND
    if (slide.customBackgroundUrl) {
      if (!this.pipImageCache.has(slide.customBackgroundUrl)) {
        const bgImg = new Image();
        bgImg.crossOrigin = 'anonymous';
        bgImg.src = slide.customBackgroundUrl;
        bgImg.onload = () => this.pipImageCache.set(slide.customBackgroundUrl!, bgImg);
      } else {
        const bgImg = this.pipImageCache.get(slide.customBackgroundUrl);
        if (bgImg && bgImg.complete) {
          ctx.drawImage(bgImg, 0, 0, w, h);
          ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
          ctx.fillRect(0, 0, w, h);
        }
      }
    } else if (slide.backgroundTheme === 'neutral_solid') {
      ctx.fillStyle = slide.customBackgroundColor || '#090d16';
      ctx.fillRect(0, 0, w, h);
    } else if (slide.backgroundTheme === 'neutral_gradient') {
      const grad = ctx.createLinearGradient(0, 0, w, h);
      grad.addColorStop(0, slide.customGradientFrom || '#1e293b');
      grad.addColorStop(1, slide.customGradientTo || '#020617');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);
    } else if (slide.backgroundTheme === 'neutral_bokeh') {
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, '#18181b');
      grad.addColorStop(1, '#09090b');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Bokeh orbs
      ctx.fillStyle = 'rgba(100, 116, 139, 0.12)';
      ctx.beginPath();
      ctx.arc(w * 0.2, h * 0.3, 140, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(56, 189, 248, 0.08)';
      ctx.beginPath();
      ctx.arc(w * 0.75, h * 0.35, 180, 0, Math.PI * 2);
      ctx.fill();
    } else if (slide.backgroundTheme === 'breaking_red') {
      const grad = ctx.createLinearGradient(0, 0, w, h);
      grad.addColorStop(0, '#1a0508');
      grad.addColorStop(0.5, '#2c0a0f');
      grad.addColorStop(1, '#0d0204');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(w / 2, h / 2, 280, 0, Math.PI * 2);
      ctx.stroke();
    } else if (slide.backgroundTheme === 'cyber_globe') {
      const grad = ctx.createLinearGradient(0, 0, w, h);
      grad.addColorStop(0, '#03131e');
      grad.addColorStop(0.5, '#052136');
      grad.addColorStop(1, '#020a12');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);
    } else if (slide.backgroundTheme === 'financial_blue') {
      const grad = ctx.createLinearGradient(0, 0, w, h);
      grad.addColorStop(0, '#071328');
      grad.addColorStop(0.5, '#0c1e3d');
      grad.addColorStop(1, '#050b18');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);
    } else {
      // neutral_studio (default clean modern studio)
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, '#1e293b');
      grad.addColorStop(0.6, '#0f172a');
      grad.addColorStop(1, '#020617');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Subtle center studio spotlight
      const spot = ctx.createRadialGradient(w / 2, 100, 20, w / 2, 100, 450);
      spot.addColorStop(0, 'rgba(148, 163, 184, 0.12)');
      spot.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = spot;
      ctx.fillRect(0, 0, w, h);
    }

    // 2. PICTURE-IN-PICTURE (OVER-THE-SHOULDER)
    if (slide.showPip && slide.pipImageUrl) {
      let pipX = w - 380;
      let pipY = 50;
      let pipW = 330;
      let pipH = 200;

      if (slide.pipPosition === 'top_left') {
        pipX = 50;
      }

      ctx.save();
      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(pipX, pipY, pipW, pipH, 12);
      ctx.fill();
      ctx.stroke();

      // Check image in cache
      if (!this.pipImageCache.has(slide.pipImageUrl)) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = slide.pipImageUrl;
        img.onload = () => this.pipImageCache.set(slide.pipImageUrl, img);
      } else {
        const img = this.pipImageCache.get(slide.pipImageUrl);
        if (img && img.complete) {
          ctx.save();
          ctx.beginPath();
          ctx.roundRect(pipX, pipY, pipW, pipH - 45, [12, 12, 0, 0]);
          ctx.clip();
          ctx.drawImage(img, pipX, pipY, pipW, pipH - 45);
          ctx.restore();
        }
      }

      // PiP Caption
      ctx.fillStyle = '#090d16';
      ctx.fillRect(pipX, pipY + pipH - 45, pipW, 45);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 14px sans-serif';
      ctx.fillText(slide.pipTitle || 'NOTIZIA', pipX + 12, pipY + pipH - 24, pipW - 24);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '11px sans-serif';
      ctx.fillText(slide.pipSubtitle || '', pipX + 12, pipY + pipH - 8, pipW - 24);

      // PiP Tag
      if (slide.pipTag) {
        ctx.fillStyle = '#dc2626';
        ctx.beginPath();
        ctx.roundRect(pipX + 8, pipY + 8, 75, 20, 4);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 10px monospace';
        ctx.fillText(slide.pipTag.toUpperCase(), pipX + 14, pipY + 22);
      }
      ctx.restore();
    }

    // 3. ANCHOR AVATAR
    const viseme = lipSyncEngine.update(avatar.lipSyncSensitivity, avatar.mouthMovementRange);
    this.renderAvatar(ctx, w, h, avatar, viseme, elapsedSec);

    // 4. CLOSING CREDITS OR LOWER THIRD OVERLAY
    if (showCredits) {
      this.renderCredits(ctx, w, h, credits, broadcast, elapsedSec);
    } else {
      this.renderLowerThird(ctx, w, h, slide, broadcast);
      this.renderTicker(ctx, w, h, broadcast, elapsedSec);
    }

    // 5. TOP WATERMARK & LIVE BUG
    this.renderTopBug(ctx, w, h, broadcast);
  }

  private renderAvatar(
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    avatar: AvatarSettings,
    viseme: any,
    elapsedSec: number
  ) {
    ctx.save();
    let anchorX = w / 2;
    if (avatar.position === 'desk_right') anchorX = w * 0.65;
    if (avatar.position === 'desk_left') anchorX = w * 0.35;

    const profile = AVATAR_PROFILES.find((p) => p.id === avatar.character) || AVATAR_PROFILES[0];
    const activePhoto =
      avatar.character === 'custom' && avatar.customAvatarUrl
        ? avatar.customAvatarUrl
        : profile.photoUrl;

    const scale = avatar.scale || 1.0;
    const targetH = h * 0.86 * scale;
    const targetW = targetH * (896 / 1200);
    const breathing = Math.sin(elapsedSec * 1.8) * 1.5;
    const targetY = h - targetH + breathing * 0.4;
    const targetX = anchorX - targetW / 2;

    // Cache image
    if (!this.pipImageCache.has(activePhoto)) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = activePhoto;
      img.onload = () => this.pipImageCache.set(activePhoto, img);
    }

    const anchorImg = this.pipImageCache.get(activePhoto);
    if (anchorImg && anchorImg.complete) {
      // 1. Draw photorealistic presenter portrait
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(targetX, targetY, targetW, targetH, 18);
      ctx.clip();
      ctx.drawImage(anchorImg, targetX, targetY, targetW, targetH);
      ctx.restore();

      // Portrait border
      ctx.strokeStyle = 'rgba(71, 85, 105, 0.6)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(targetX, targetY, targetW, targetH, 18);
      ctx.stroke();

      // 2. Synchronized dynamic mouth overlay - Subtle and naturally proportioned
      const mouthOpacity = Math.max(0, Math.min(0.85, (viseme.openness - 0.07) * 4.5));
      if (mouthOpacity > 0.05) {
        ctx.save();
        ctx.globalAlpha = mouthOpacity;

        const mc = profile.mouthCoords;
        const mouthCenterX = targetX + mc.x * targetW;
        const mouthCenterY = targetY + mc.y * targetH + (viseme.jawDrop || 0) * 1.5;

        // Anatomically proportionate half-width
        const mouthHalfW = (mc.w * targetW * 0.5) * (0.92 + viseme.width * 0.12);
        // Subtle restrained vertical opening (max 6.5px)
        const mouthH = Math.min(6.5, viseme.openness * 14 * (avatar.mouthMovementRange || 1.0));

        const leftCornerX = mouthCenterX - mouthHalfW;
        const rightCornerX = mouthCenterX + mouthHalfW;
        const cornerY = mouthCenterY;

        const upperLipPeakY = mouthCenterY - mouthH * 0.45;
        const lowerLipBottomY = mouthCenterY + mouthH * 0.75;

        // Subtle dark interior cavity
        ctx.fillStyle = 'rgba(40, 12, 16, 0.85)';
        ctx.beginPath();
        ctx.moveTo(leftCornerX, cornerY);
        ctx.quadraticCurveTo(mouthCenterX, upperLipPeakY, rightCornerX, cornerY);
        ctx.quadraticCurveTo(mouthCenterX, lowerLipBottomY, leftCornerX, cornerY);
        ctx.fill();

        // Delicate upper teeth peeking
        if (viseme.teethVisible > 0.2 && viseme.openness > 0.12) {
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.6;
          ctx.beginPath();
          ctx.moveTo(mouthCenterX - mouthHalfW * 0.55, upperLipPeakY + 1);
          ctx.quadraticCurveTo(mouthCenterX, upperLipPeakY + 2.5, mouthCenterX + mouthHalfW * 0.55, upperLipPeakY + 1);
          ctx.stroke();
        }

        // Soft natural lip contour lines
        ctx.strokeStyle = 'rgba(159, 55, 71, 0.55)';
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(leftCornerX, cornerY);
        ctx.quadraticCurveTo(mouthCenterX, upperLipPeakY - 0.5, rightCornerX, cornerY);
        ctx.stroke();

        ctx.strokeStyle = 'rgba(181, 67, 86, 0.6)';
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(leftCornerX, cornerY);
        ctx.quadraticCurveTo(mouthCenterX, lowerLipBottomY + 1, rightCornerX, cornerY);
        ctx.stroke();

        ctx.restore();
      }

      // 3. Television Anchor Studio Countertop Desk Overlay
      const deskY = h - 55;
      const deskH = 55;
      const deskGrad = ctx.createLinearGradient(0, deskY, 0, h);
      deskGrad.addColorStop(0, 'rgba(15, 23, 42, 0.95)');
      deskGrad.addColorStop(1, '#020617');
      ctx.fillStyle = deskGrad;
      ctx.fillRect(targetX, deskY, targetW, deskH);

      // Glowing desk edge
      const edgeGrad = ctx.createLinearGradient(targetX, 0, targetX + targetW, 0);
      edgeGrad.addColorStop(0, 'rgba(56, 189, 248, 0.1)');
      edgeGrad.addColorStop(0.5, 'rgba(56, 189, 248, 0.9)');
      edgeGrad.addColorStop(1, 'rgba(56, 189, 248, 0.1)');
      ctx.strokeStyle = edgeGrad;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(targetX, deskY);
      ctx.lineTo(targetX + targetW, deskY);
      ctx.stroke();
    }

    ctx.restore();
  }

  private renderLowerThird(
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    slide: NewsSlide,
    broadcast: BroadcastSettings
  ) {
    const barX = 40;
    const barY = h - 195;
    const barW = w - 80;
    const barH = 120;

    ctx.save();
    // Glassy dark backdrop with crisp borders
    ctx.fillStyle = 'rgba(2, 6, 23, 0.95)';
    ctx.strokeStyle = broadcast.primaryColor || '#e11d48';
    ctx.lineWidth = 3.5;

    ctx.beginPath();
    ctx.roundRect(barX, barY, barW, barH, 14);
    ctx.fill();
    ctx.stroke();

    // Top primary accent stripe
    ctx.fillStyle = broadcast.primaryColor || '#e11d48';
    ctx.beginPath();
    ctx.roundRect(barX, barY, barW, 5, [14, 14, 0, 0]);
    ctx.fill();

    // Category Badge
    ctx.fillStyle = broadcast.primaryColor || '#e11d48';
    ctx.beginPath();
    ctx.roundRect(barX + 20, barY + 14, 160, 26, 6);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 13px monospace';
    ctx.fillText(slide.category || 'NOTIZIA', barX + 30, barY + 32);

    // Live studio detail tag
    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 13px monospace';
    ctx.fillText('• EDIZIONE SPECIALE', barX + 195, barY + 32);

    // Main Headline (Gigantic, High Impact, Highly Legible in export)
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 34px sans-serif';
    ctx.fillText(slide.headline || '', barX + 20, barY + 74, barW - 40);

    // Sub-Headline (Clear, readable contrast)
    if (slide.subHeadline) {
      ctx.fillStyle = '#cbd5e1';
      ctx.font = 'bold 20px sans-serif';
      ctx.fillText(slide.subHeadline, barX + 20, barY + 106, barW - 40);
    }

    ctx.restore();
  }

  private renderTicker(
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    broadcast: BroadcastSettings,
    elapsedSec: number
  ) {
    if (!broadcast.showTicker) return;

    // Enormous, tall ticker banner for crystal-clear readability
    const tickerY = h - 68;
    const tickerH = 58;

    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.98)';
    ctx.fillRect(0, tickerY, w, tickerH);

    // Ticker Tag
    ctx.fillStyle = broadcast.primaryColor || '#e11d48';
    ctx.fillRect(0, tickerY, 170, tickerH);

    ctx.fillStyle = '#ffffff';
    ctx.font = '900 18px monospace';
    ctx.fillText('FLASH NEWS', 22, tickerY + 36);

    // Marquee text in massive 24px bold monospace
    const fullText = (broadcast.tickerItems || []).join('    •    ');
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px monospace';

    const textWidth = ctx.measureText(fullText).width;
    const speed = 80; // px per second
    const offsetX = (elapsedSec * speed) % (textWidth + 350);

    ctx.save();
    ctx.beginPath();
    ctx.rect(180, tickerY, w - 180, tickerH);
    ctx.clip();

    ctx.fillText(fullText, 180 - offsetX, tickerY + 36);
    ctx.fillText(fullText, 180 - offsetX + textWidth + 150, tickerY + 36);
    ctx.restore();

    ctx.restore();
  }

  private renderTopBug(
    ctx: CanvasRenderingContext2D,
    w: number,
    _h: number,
    broadcast: BroadcastSettings
  ) {
    ctx.save();
    // Channel Bug
    ctx.fillStyle = broadcast.primaryColor || '#e11d48';
    ctx.beginPath();
    ctx.roundRect(40, 26, 115, 34, 8);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px monospace';
    ctx.fillText(broadcast.channelLogoText || 'TG24', 52, 49);

    // Live red dot
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(138, 43, 4.5, 0, Math.PI * 2);
    ctx.fill();

    // Channel name tag
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.beginPath();
    ctx.roundRect(165, 26, 175, 34, 8);
    ctx.fill();

    ctx.fillStyle = '#f1f5f9';
    ctx.font = 'bold 13px sans-serif';
    ctx.fillText(broadcast.channelName || 'TG NOTIZIE', 178, 48);

    // Clock
    const now = new Date();
    const timeStr = now.toLocaleTimeString('it-IT');
    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    ctx.beginPath();
    ctx.roundRect(w - 150, 26, 110, 34, 8);
    ctx.fill();

    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 15px monospace';
    ctx.fillText(timeStr, w - 138, 49);

    ctx.restore();
  }

  private renderCredits(
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    credits: CreditsSettings,
    broadcast: BroadcastSettings,
    elapsedSec: number
  ) {
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.94)';
    ctx.fillRect(0, 0, w, h);

    const crawlSpeed = 40; // px per sec
    const startY = h + 60 - elapsedSec * crawlSpeed;

    ctx.textAlign = 'center';

    // Massive, crystal-clear font sizes for broadcast video legibility
    const isExtraLarge = credits.fontSize === 'extra_large';
    const isNormal = credits.fontSize === 'normal';

    const titleSize = isExtraLarge ? 64 : isNormal ? 46 : 56;
    const headerSize = isExtraLarge ? 30 : isNormal ? 22 : 26;
    const roleSize = isExtraLarge ? 26 : isNormal ? 19 : 23;
    const nameSize = isExtraLarge ? 52 : isNormal ? 36 : 45;
    const itemGap = isExtraLarge ? 130 : isNormal ? 95 : 115;

    // Red separator bar
    ctx.fillStyle = '#e11d48';
    ctx.fillRect(w / 2 - 80, startY - titleSize - 20, 160, 6);

    // Channel title
    ctx.fillStyle = '#ffffff';
    ctx.font = `900 ${titleSize}px monospace`;
    ctx.fillText(broadcast.channelName || 'STUDIO TG 24', w / 2, startY);

    ctx.fillStyle = '#cbd5e1';
    ctx.font = `bold ${headerSize}px sans-serif`;
    ctx.fillText(credits.header || 'PRODUZIONE TELEVISIVA & REGIA', w / 2, startY + headerSize + 18);

    if (credits.subHeader) {
      ctx.fillStyle = '#94a3b8';
      ctx.font = `18px sans-serif`;
      ctx.fillText(credits.subHeader, w / 2, startY + headerSize + 46);
    }

    let currY = startY + titleSize + headerSize + 90;
    for (const item of credits.items) {
      // Role with high contrast accent
      ctx.fillStyle = broadcast.primaryColor || '#fb7185';
      ctx.font = `bold ${roleSize}px monospace`;
      ctx.fillText(item.role.toUpperCase(), w / 2, currY);

      // Name in huge crisp white bold
      ctx.fillStyle = '#ffffff';
      ctx.font = `bold ${nameSize}px sans-serif`;
      ctx.fillText(item.name, w / 2, currY + nameSize + 4);

      currY += itemGap;
    }

    ctx.restore();
  }
}

export const canvasBroadcastRenderer = new CanvasBroadcastRenderer();
