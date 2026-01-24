(function () {
  // month override for testing: ?m=7 or ?month=7 or ?season=summer
  const params = new URLSearchParams(location.search);

  const seasonFromName = (name) => {
    if (!name) return null;
    const s = String(name).toLowerCase();
    if (s.startsWith('win')) return 'winter';
    if (s.startsWith('spr')) return 'spring';
    if (s.startsWith('sum')) return 'summer';
    if (s.startsWith('aut') || s.startsWith('fal')) return 'autumn';
    if (s.startsWith('pla') || s.startsWith('nor') || s.startsWith('base')) return 'plain';
    return null;
  };

  let month = null;
  const mRaw = params.get('m') || params.get('month');
  if (mRaw && /^[0-9]{1,2}$/.test(mRaw)) {
    const m = parseInt(mRaw, 10);
    if (m >= 1 && m <= 12) month = m;
  }

  let season = seasonFromName(params.get('season'));

  // Determine season from month when not explicitly provided
  if (!season) {
    const nowMonth = month ?? (new Date().getMonth() + 1); // 1-12
    if (nowMonth === 12 || nowMonth === 1 || nowMonth === 2) season = 'winter';
    else if (nowMonth === 3 || nowMonth === 4) season = 'spring';
    else if (nowMonth === 5 || nowMonth === 6) season = 'plain';
    else if (nowMonth === 7 || nowMonth === 8) season = 'summer';
    else season = 'autumn';
  }

  document.documentElement.classList.add('season-' + season);
  document.body.classList.add('season-' + season);

  // Force animations even if iOS "Reduce Motion" is ON: add ?motion=1
  const motion = params.get('motion');
  if (motion === '1' || motion === 'on' || motion === 'true') {
    document.documentElement.classList.add('force-motion');
    document.body.classList.add('force-motion');
  }

  // For debugging (optional): show chosen season in console
  console.log('[keikoba] season =', season, 'monthOverride =', month, 'forceMotion =', !!motion);
})();