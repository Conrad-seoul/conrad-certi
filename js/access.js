/* Admin mode (menu/feature visibility only — NOT a security boundary: the database stays open
   to the anon key exactly as before, see supabase-open.sql). General users see only 개요 /
   증서 목록 / 사용자 가이드, and in the Certificate List can only issue / use / void-refund.
   Everything else (other menus, unlock-edit, bulk field set, mark reviewed, grace use, delete,
   extend validity) appears only after entering the admin password, which is remembered per
   browser (localStorage) until "관리자 모드 종료". The password is compared as a SHA-256 hex hash
   against CertApp.config.admin.passwordHash, so the plain password never sits in the repo. */
window.CertApp = window.CertApp || {};
CertApp.access = (function () {
  var KEY = 'certapp_admin';
  var GENERAL_VIEWS = ['overview', 'certlist', 'guide'];

  function isAdmin() {
    try { return localStorage.getItem(KEY) === '1'; } catch (e) { return false; }
  }

  function canView(name) { return isAdmin() || GENERAL_VIEWS.indexOf(name) !== -1; }

  function sha256Hex(text) {
    if (!window.crypto || !crypto.subtle) return Promise.reject(new Error('crypto.subtle unavailable'));
    return crypto.subtle.digest('SHA-256', new TextEncoder().encode(text)).then(function (buf) {
      return Array.prototype.map.call(new Uint8Array(buf), function (b) {
        return ('0' + b.toString(16)).slice(-2);
      }).join('');
    });
  }

  // Resolves true when the password matches (and admin mode is switched on), false otherwise.
  function enter(password) {
    var expected = ((CertApp.config.admin && CertApp.config.admin.passwordHash) || '').toLowerCase();
    if (!expected) return Promise.resolve(false);
    return sha256Hex(password || '').then(function (hex) {
      if (hex !== expected) return false;
      try { localStorage.setItem(KEY, '1'); } catch (e) {}
      apply();
      return true;
    });
  }

  function exit() {
    try { localStorage.removeItem(KEY); } catch (e) {}
    apply();
  }

  // Show/hide sidebar menus + the admin toggle label, then bounce off a view that is no longer
  // allowed (e.g. right after leaving admin mode while on 감사 로그).
  function apply() {
    document.querySelectorAll('.nav-item').forEach(function (n) {
      n.style.display = canView(n.dataset.view) ? '' : 'none';
    });
    document.body.classList.toggle('is-admin', isAdmin());
    if (CertApp.ui && CertApp.ui.renderAdminToggle) CertApp.ui.renderAdminToggle();
    if (CertApp.router) {
      var cur = CertApp.router.getCurrent();
      if (cur && !canView(cur)) CertApp.router.go('overview');
      else if (cur) CertApp.router.refresh();
    }
  }

  return { isAdmin: isAdmin, canView: canView, enter: enter, exit: exit, apply: apply, GENERAL_VIEWS: GENERAL_VIEWS };
})();
