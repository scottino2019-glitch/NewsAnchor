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
  private creditsStartTime: number | null = null;
  private lastShowCredits = false;

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
    this.creditsStartTime = null;
    this.lastShowCredits = false;

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
    this.creditsStartTime = null;
    this.lastShowCredits = false;
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

    // 2. CLOSING CREDITS FULL SCREEN OVERLAY
    if (showCredits) {
      if (!this.lastShowCredits || this.creditsStartTime === null) {
        this.creditsStartTime = time;
      }
      this.lastShowCredits = true;
      const creditsElapsedSec = (time - this.creditsStartTime) / 1000;
      this.renderCredits(ctx, w, h, credits, broadcast, creditsElapsedSec);
      return;
    } else {
      this.creditsStartTime = null;
      this.lastShowCredits = false;
    }

    // 3. ANCHOR AVATAR
    const viseme = lipSyncEngine.update(avatar.lipSyncSensitivity, avatar.mouthMovementRange);
    this.renderAvatar(ctx, w, h, avatar, viseme, elapsedSec);

    // 4. PICTURE-IN-PICTURE (OVER-THE-SHOULDER GRAPHIC)
    if (slide.showPip) {
      this.renderPip(ctx, w, h, slide);
    }

    // 5. LOWER THIRD & TICKER
    this.renderLowerThird(ctx, w, h, slide, broadcast);
    this.renderTicker(ctx, w, h, broadcast, elapsedSec);

    // 6. TOP WATERMARK & LIVE BUG
    this.renderTopBug(ctx, w, h, broadcast);
  }

  private renderPip(
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    slide: NewsSlide
  ) {
    // 1. Determine geometry based on chosen pipPosition
    const position = slide.pipPosition || 'top_right';

    let pipW = 340;
    let pipH = 220;
    let pipX = w - pipW - 32;
    let pipY = 24;
    let titleFontSize = 13;
    let subtitleFontSize = 11;
    let captionH = 48;

    if (position === 'top_left') {
      pipW = 340;
      pipH = 220;
      pipX = 32;
      pipY = 24;
      captionH = 48;
      titleFontSize = 13;
      subtitleFontSize = 11;
    } else if (position === 'corner_large') {
      pipW = 430;
      pipH = 275;
      pipX = w - pipW - 32;
      pipY = 26;
      captionH = 54;
      titleFontSize = 15;
      subtitleFontSize = 12;
    } else if (position === 'split_screen') {
      pipW = 540;
      pipH = 440;
      pipX = w - pipW - 28;
      pipY = 24;
      captionH = 62;
      titleFontSize = 16;
      subtitleFontSize = 13;
    } else {
      // 'top_right' (default)
      pipW = 340;
      pipH = 220;
      pipX = w - pipW - 32;
      pipY = 24;
      captionH = 48;
      titleFontSize = 13;
      subtitleFontSize = 11;
    }

    const imageH = pipH - captionH;
    const radius = 12;

    ctx.save();

    // 2. Outer card shadow for elevation depth
    ctx.shadowColor = 'rgba(0, 0, 0, 0.65)';
    ctx.shadowBlur = 22;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 8;

    // Card background
    ctx.beginPath();
    ctx.roundRect(pipX, pipY, pipW, pipH, radius);
    ctx.fillStyle = '#090d16';
    ctx.fill();

    // Glowing border ring
    const borderGrad = ctx.createLinearGradient(pipX, pipY, pipX + pipW, pipY + pipH);
    borderGrad.addColorStop(0, '#dc2626');
    borderGrad.addColorStop(0.5, '#0ea5e9');
    borderGrad.addColorStop(1, '#6366f1');
    ctx.strokeStyle = borderGrad;
    ctx.lineWidth = 2.5;
    ctx.stroke();

    ctx.restore(); // remove shadow for inner rendering

    // 3. Image Area with object-cover clipping
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(pipX, pipY, pipW, imageH, [radius, radius, 0, 0]);
    ctx.clip();

    if (slide.pipImageUrl) {
      if (!this.pipImageCache.has(slide.pipImageUrl)) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = slide.pipImageUrl;
        img.onload = () => this.pipImageCache.set(slide.pipImageUrl, img);
      }

      const img = this.pipImageCache.get(slide.pipImageUrl);
      if (img && img.complete && img.naturalWidth > 0) {
        // High quality object-cover scaling
        const imgAspect = img.naturalWidth / img.naturalHeight;
        const boxAspect = pipW / imageH;
        let sx = 0, sy = 0, sw = img.naturalWidth, sh = img.naturalHeight;
        if (imgAspect > boxAspect) {
          sw = img.naturalHeight * boxAspect;
          sx = (img.naturalWidth - sw) / 2;
        } else {
          sh = img.naturalWidth / boxAspect;
          sy = (img.naturalHeight - sh) / 2;
        }
        ctx.drawImage(img, sx, sy, sw, sh, pipX, pipY, pipW, imageH);
      } else {
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(pipX, pipY, pipW, imageH);
      }
    } else {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(pipX, pipY, pipW, imageH);
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('NESSUNA IMMAGINE PIP', pipX + pipW / 2, pipY + imageH / 2);
      ctx.textAlign = 'left';
    }

    // Bottom gradient overlay for caption contrast
    const bottomGrad = ctx.createLinearGradient(pipX, pipY + imageH - 45, pipX, pipY + imageH);
    bottomGrad.addColorStop(0, 'rgba(2, 6, 23, 0)');
    bottomGrad.addColorStop(1, 'rgba(2, 6, 23, 0.9)');
    ctx.fillStyle = bottomGrad;
    ctx.fillRect(pipX, pipY + imageH - 45, pipW, 45);

    ctx.restore(); // unclip image

    // 4. Live / Topic Badge on top-left of PiP
    if (slide.pipTag) {
      ctx.save();
      const tagText = slide.pipTag.toUpperCase();
      ctx.font = 'bold 10px monospace';
      const textMetrics = ctx.measureText(tagText);
      const tagW = Math.max(65, textMetrics.width + 24);
      const tagH = 20;
      const tagX = pipX + 10;
      const tagY = pipY + 10;

      // Badge pill
      ctx.fillStyle = 'rgba(220, 38, 38, 0.95)';
      ctx.beginPath();
      ctx.roundRect(tagX, tagY, tagW, tagH, 4);
      ctx.fill();

      // Blinking white live dot
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(tagX + 8, tagY + tagH / 2, 2.5, 0, Math.PI * 2);
      ctx.fill();

      // Badge label
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 10px monospace';
      ctx.fillText(tagText, tagX + 16, tagY + 14);
      ctx.restore();
    }

    // 5. Lower Caption Bar
    ctx.save();
    ctx.fillStyle = '#020617';
    ctx.beginPath();
    ctx.roundRect(pipX, pipY + imageH, pipW, captionH, [0, 0, radius, radius]);
    ctx.fill();

    // Top border separating image and caption
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(pipX, pipY + imageH);
    ctx.lineTo(pipX + pipW, pipY + imageH);
    ctx.stroke();

    // Caption Headline
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${titleFontSize}px sans-serif`;
    const titleText = (slide.pipTitle || 'NOTIZIA').toUpperCase();
    const titleY = slide.pipSubtitle
      ? pipY + imageH + captionH * 0.44
      : pipY + imageH + captionH * 0.58;
    ctx.fillText(titleText, pipX + 14, titleY, pipW - 28);

    // Caption Subtitle
    if (slide.pipSubtitle) {
      ctx.fillStyle = '#cbd5e1';
      ctx.font = `${subtitleFontSize}px sans-serif`;
      ctx.fillText(slide.pipSubtitle, pipX + 14, pipY + imageH + captionH * 0.82, pipW - 28);
    }

    ctx.restore();
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
    creditsElapsedSec: number
  ) {
    ctx.save();
    // Solid deep black backdrop
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, w, h);

    // Subtle ambient glow in center
    const bgGrad = ctx.createRadialGradient(w / 2, h / 2, 40, w / 2, h / 2, 520);
    bgGrad.addColorStop(0, 'rgba(30, 41, 59, 0.45)');
    bgGrad.addColorStop(1, 'rgba(0, 0, 0, 0.98)');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    // Font size configurations
    const isExtraLarge = credits.fontSize === 'extra_large';
    const isNormal = credits.fontSize === 'normal';

    const titleSize = isExtraLarge ? 64 : isNormal ? 46 : 56;
    const headerSize = isExtraLarge ? 28 : isNormal ? 20 : 24;
    const roleSize = isExtraLarge ? 24 : isNormal ? 18 : 20;
    const nameSize = isExtraLarge ? 48 : isNormal ? 34 : 40;
    const itemGap = isExtraLarge ? 120 : isNormal ? 85 : 100;

    const items = credits.items || [];
    const totalContentHeight = 280 + items.length * itemGap + 220;
    const totalTravelDistance = h + totalContentHeight + 80;
    const scrollDuration = Math.max(10, credits.scrollDuration || 25);
    const crawlSpeed = totalTravelDistance / scrollDuration;

    // Smooth upward scrolling from below screen (h + 30) up past the top
    const startY = h + 30 - creditsElapsedSec * crawlSpeed;

    ctx.textAlign = 'center';

    // Top persistent header bar with glowing live dot
    ctx.fillStyle = 'rgba(0, 0, 0, 0.88)';
    ctx.fillRect(0, 0, w, 44);
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, 44);
    ctx.lineTo(w, 44);
    ctx.stroke();

    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(42, 22, 4.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 12px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('TITOLI DI CODA • REGIA FINALE', 54, 26);
    ctx.textAlign = 'center';

    // Separator bar in the crawl
    ctx.fillStyle = broadcast.primaryColor || '#e11d48';
    ctx.beginPath();
    ctx.roundRect(w / 2 - 60, startY - titleSize - 20, 120, 5, 3);
    ctx.fill();

    // Main Channel Brand
    ctx.fillStyle = '#ffffff';
    ctx.font = `900 ${titleSize}px monospace`;
    ctx.fillText(broadcast.channelName || 'STUDIO TG 24', w / 2, startY);

    // Header Title
    ctx.fillStyle = '#cbd5e1';
    ctx.font = `bold ${headerSize}px sans-serif`;
    ctx.fillText(credits.header || 'PRODUZIONE TELEVISIVA & REGIA', w / 2, startY + headerSize + 18);

    // Sub-header
    if (credits.subHeader) {
      ctx.fillStyle = '#94a3b8';
      ctx.font = '16px sans-serif';
      ctx.fillText(credits.subHeader, w / 2, startY + headerSize + 46);
    }

    // List of Credit Items
    let currY = startY + titleSize + headerSize + 90;
    for (const item of items) {
      // Role with primary color accent
      ctx.fillStyle = broadcast.primaryColor || '#fb7185';
      ctx.font = `bold ${roleSize}px monospace`;
      ctx.fillText(item.role.toUpperCase(), w / 2, currY);

      // Person Name
      ctx.fillStyle = '#ffffff';
      ctx.font = `bold ${nameSize}px sans-serif`;
      ctx.fillText(item.name, w / 2, currY + nameSize + 4);

      currY += itemGap;
    }

    // Technology and Copyright footer in the crawl
    currY += 40;
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(w / 2 - 180, currY);
    ctx.lineTo(w / 2 + 180, currY);
    ctx.stroke();

    currY += 36;
    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 14px monospace';
    ctx.fillText('SISTEMI DI TRASMISSIONE & VISUAL FX', w / 2, currY);

    currY += 28;
    ctx.fillStyle = '#e2e8f0';
    ctx.font = '16px sans-serif';
    ctx.fillText('Google Cloud & Neural Audio Text-to-Speech Engine', w / 2, currY);

    currY += 32;
    ctx.fillStyle = '#64748b';
    ctx.font = '12px monospace';
    const year = new Date().getFullYear();
    ctx.fillText(
      `© ${year} ${broadcast.channelName || 'StudioTG'}. Edizione Digitale Autonoma 4K.`,
      w / 2,
      currY
    );

    ctx.restore();
  }
}

export const canvasBroadcastRenderer = new CanvasBroadcastRenderer();
