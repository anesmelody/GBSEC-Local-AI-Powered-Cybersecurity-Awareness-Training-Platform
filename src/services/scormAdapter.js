// SCORM 1.2 Runtime API Shim for GBSEC
// Exposes window.API for Articulate Storyline's scormdriver.js
// The driver searches upward through window.parent for this object

export class Scorm12Runtime {
  constructor(onStateChange) {
    this.data = {
      'cmi.core.lesson_status': 'not attempted',
      'cmi.core.lesson_location': '',
      'cmi.core.student_id': '',
      'cmi.core.student_name': 'Admin User',
      'cmi.core.credit': 'credit',
      'cmi.core.lesson_mode': 'normal',
      'cmi.core.entry': 'ab-initio',
      'cmi.core.exit': '',
      'cmi.core.session_time': '00:00:00',
      'cmi.core.total_time': '00:00:00',
      'cmi.core.score.raw': '',
      'cmi.core.score.min': '0',
      'cmi.core.score.max': '100',
      'cmi.suspend_data': '',
      'cmi.launch_data': '',
      'cmi.comments': '',
      'cmi.interactions._count': '0',
    };
    this.onStateChange = onStateChange;
    this._initialized = false;
    this._lastError = '0';
    this._interactionCount = 0;
    this.mount();
  }

  mount() {
    const runtime = this;

    window.API = {
      LMSInitialize: (_param) => {
        if (runtime._initialized) {
          runtime._lastError = '101'; // already initialized
          return 'false';
        }
        runtime._initialized = true;
        runtime._lastError = '0';
        if (runtime.data['cmi.core.lesson_status'] === 'not attempted') {
          runtime.data['cmi.core.lesson_status'] = 'incomplete';
        }
        runtime._notify();
        return 'true';
      },

      LMSGetValue: (element) => {
        runtime._lastError = '0';

        // Handle dynamic interaction count
        if (element === 'cmi.interactions._count') {
          return String(runtime._interactionCount);
        }

        const value = runtime.data[element];
        if (value !== undefined) {
          return value;
        }

        // Return empty string for unknown elements (per SCORM 1.2 spec)
        return '';
      },

      LMSSetValue: (element, value) => {
        runtime._lastError = '0';

        // Track interactions
        if (element.startsWith('cmi.interactions.')) {
          const parts = element.split('.');
          const idx = parseInt(parts[2], 10);
          if (!isNaN(idx) && idx >= runtime._interactionCount) {
            runtime._interactionCount = idx + 1;
          }
        }

        runtime.data[element] = value;
        runtime._notify();
        return 'true';
      },

      LMSCommit: (_param) => {
        runtime._lastError = '0';
        runtime._notify();
        return 'true';
      },

      LMSFinish: (_param) => {
        runtime._lastError = '0';
        runtime._initialized = false;
        runtime._notify();
        return 'true';
      },

      LMSGetLastError: () => {
        return runtime._lastError;
      },

      LMSGetErrorString: (errorCode) => {
        const errors = {
          '0': 'No error',
          '101': 'General exception',
          '201': 'Invalid argument error',
          '202': 'Element cannot have children',
          '203': 'Element not an array - cannot have count',
          '301': 'Not initialized',
          '401': 'Not implemented error',
          '402': 'Invalid set value, element is a keyword',
          '403': 'Element is read only',
          '404': 'Element is write only',
          '405': 'Incorrect data type',
        };
        return errors[errorCode] || 'Unknown error';
      },

      LMSGetDiagnostic: (errorCode) => {
        return `Diagnostic for error ${errorCode}`;
      },
    };
  }

  _notify() {
    if (this.onStateChange) {
      this.onStateChange({ ...this.data });
    }
  }

  getState() {
    return { ...this.data };
  }

  destroy() {
    if (window.API) {
      delete window.API;
    }
  }
}
