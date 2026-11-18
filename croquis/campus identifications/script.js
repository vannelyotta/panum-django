(function () {
    const STORAGE_KEY = "campus_identifications_accounts";
    const SESSION_KEY = "campus_identifications_session";

    const ROLE_CONFIG = {
        student: {
            prefix: "stu",
            minAge: 10,
            maxAge: 75,
            idPlaceholder: "stu-1001",
            departmentLabel: "student grade or level",
            departments: [
                "grade 10",
                "grade 11",
                "grade 12",
                "undergraduate year 1",
                "undergraduate year 2",
                "undergraduate year 3"
            ]
        },
        teacher: {
            prefix: "tch",
            minAge: 21,
            maxAge: 75,
            idPlaceholder: "tch-2001",
            departmentLabel: "teaching department",
            departments: [
                "mathematics department",
                "sciences department",
                "languages department",
                "humanities department",
                "computer science department"
            ]
        },
        coordinator: {
            prefix: "crd",
            minAge: 23,
            maxAge: 75,
            idPlaceholder: "crd-3001",
            departmentLabel: "coordination division",
            departments: [
                "academic affairs coordination",
                "student life coordination",
                "examinations coordination",
                "curriculum coordination"
            ]
        }
    };

    function getAccounts() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) {
                return [];
            }
            const parsed = JSON.parse(raw);
            return Array.isArray(parsed) ? parsed : [];
        } catch (err) {
            return [];
        }
    }

    function saveAccounts(accounts) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
        } catch (err) {
            return;
        }
    }

    function getSession() {
        try {
            const raw = localStorage.getItem(SESSION_KEY);
            return raw ? JSON.parse(raw) : null;
        } catch (err) {
            return null;
        }
    }

    function saveSession(sessionData) {
        try {
            if (sessionData) {
                localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
            } else {
                localStorage.removeItem(SESSION_KEY);
            }
        } catch (err) {
            return;
        }
    }

    function normalizeText(value) {
        return String(value || "").trim().toLowerCase();
    }

    function calculateAge(birthDateString) {
        if (!birthDateString) {
            return -1;
        }
        const today = new Date();
        const birth = new Date(birthDateString);
        if (Number.isNaN(birth.getTime())) {
            return -1;
        }
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age -= 1;
        }
        return age;
    }

    function findAccountByIdentifier(identifier) {
        const clean = normalizeText(identifier);
        if (!clean) {
            return null;
        }
        const accounts = getAccounts();
        return accounts.find(function (acc) {
            return acc.email === clean || acc.campusId === clean;
        }) || null;
    }

    function getRoleAccounts(role) {
        const cleanRole = normalizeText(role);
        return getAccounts().filter(function (acc) {
            return acc.role === cleanRole;
        });
    }

    function setFieldState(inputEl, feedbackEl, isValid, message) {
        if (!inputEl || !feedbackEl) {
            return isValid;
        }
        inputEl.classList.remove("input-valid", "input-invalid");
        feedbackEl.classList.remove("feedback-valid", "feedback-invalid");
        if (isValid === true) {
            inputEl.classList.add("input-valid");
            feedbackEl.classList.add("feedback-valid");
        } else if (isValid === false) {
            inputEl.classList.add("input-invalid");
            feedbackEl.classList.add("feedback-invalid");
        }
        feedbackEl.textContent = normalizeText(message);
        return isValid;
    }

    function setBannerState(bannerEl, statusType, message) {
        if (!bannerEl) {
            return;
        }
        bannerEl.classList.remove("status-success", "status-error", "status-warning");
        if (statusType === "success") {
            bannerEl.classList.add("status-success");
        } else if (statusType === "error") {
            bannerEl.classList.add("status-error");
        } else if (statusType === "warning") {
            bannerEl.classList.add("status-warning");
        }
        bannerEl.textContent = normalizeText(message);
    }

    function setRuleItemState(itemEl, passed) {
        if (!itemEl) {
            return;
        }
        itemEl.classList.remove("rule-ok", "rule-fail");
        if (passed === true) {
            itemEl.classList.add("rule-ok");
        } else if (passed === false) {
            itemEl.classList.add("rule-fail");
        }
    }

    document.addEventListener("DOMContentLoaded", function () {
        const pageRole = normalizeText(document.body.getAttribute("data-role")) || "student";

        const roleSelectGlobal = document.querySelector("[data-element='role-selector']");
        const accountCheckInput = document.querySelector("[data-element='account-check-input']");
        const accountCheckBtn = document.querySelector("[data-element='account-check-btn']");
        const modeLoginBtn = document.querySelector("[data-element='mode-login-btn']");
        const modeRegisterBtn = document.querySelector("[data-element='mode-register-btn']");
        const accountStatusBanner = document.querySelector("[data-element='account-status-banner']");
        const accountCountText = document.querySelector("[data-element='account-count-text']");

        const loginFieldset = document.querySelector("[data-element='login-fieldset']");
        const loginForm = document.querySelector("[data-element='login-form']");
        const loginRoleSelect = document.querySelector("[data-element='login-role']");
        const loginIdentifierInput = document.querySelector("[data-element='login-identifier']");
        const loginIdentifierFeedback = document.querySelector("[data-element='login-identifier-feedback']");
        const loginPasswordInput = document.querySelector("[data-element='login-password']");
        const loginPasswordFeedback = document.querySelector("[data-element='login-password-feedback']");
        const loginBanner = document.querySelector("[data-element='login-banner']");

        const registerFieldset = document.querySelector("[data-element='register-fieldset']");
        const registerForm = document.querySelector("[data-element='register-form']");
        const regRoleSelect = document.querySelector("[data-element='reg-role']");
        const regNameInput = document.querySelector("[data-element='reg-name']");
        const regNameFeedback = document.querySelector("[data-element='reg-name-feedback']");
        const regCampusIdInput = document.querySelector("[data-element='reg-campus-id']");
        const regCampusIdFeedback = document.querySelector("[data-element='reg-campus-id-feedback']");
        const regDobInput = document.querySelector("[data-element='reg-dob']");
        const regDobFeedback = document.querySelector("[data-element='reg-dob-feedback']");
        const regPhoneInput = document.querySelector("[data-element='reg-phone']");
        const regPhoneFeedback = document.querySelector("[data-element='reg-phone-feedback']");
        const regDepartmentLabel = document.querySelector("[data-element='reg-department-label']");
        const regDepartmentSelect = document.querySelector("[data-element='reg-department']");
        const regDepartmentFeedback = document.querySelector("[data-element='reg-department-feedback']");
        const regEmailInput = document.querySelector("[data-element='reg-email']");
        const regEmailFeedback = document.querySelector("[data-element='reg-email-feedback']");
        const regConfirmEmailInput = document.querySelector("[data-element='reg-confirm-email']");
        const regConfirmEmailFeedback = document.querySelector("[data-element='reg-confirm-email-feedback']");
        const regPasswordInput = document.querySelector("[data-element='reg-password']");
        const regPasswordFeedback = document.querySelector("[data-element='reg-password-feedback']");
        const regConfirmPasswordInput = document.querySelector("[data-element='reg-confirm-password']");
        const regConfirmPasswordFeedback = document.querySelector("[data-element='reg-confirm-password-feedback']");
        const registerBanner = document.querySelector("[data-element='register-banner']");

        const ruleNameItem = document.querySelector("[data-rule='name']");
        const ruleIdItem = document.querySelector("[data-rule='campus-id']");
        const ruleAgeItem = document.querySelector("[data-rule='age']");
        const ruleEmailItem = document.querySelector("[data-rule='email']");
        const rulePasswordItem = document.querySelector("[data-rule='password']");

        const sessionSection = document.querySelector("[data-element='session-section']");
        const sessionSummary = document.querySelector("[data-element='session-summary']");
        const sessionDetailsList = document.querySelector("[data-element='session-details']");
        const logoutBtn = document.querySelector("[data-element='logout-btn']");

        function getCurrentRole() {
            if (regRoleSelect && regRoleSelect.value) {
                return normalizeText(regRoleSelect.value);
            }
            if (loginRoleSelect && loginRoleSelect.value) {
                return normalizeText(loginRoleSelect.value);
            }
            return pageRole;
        }

        function populateDepartments(role) {
            if (!regDepartmentSelect) {
                return;
            }
            const config = ROLE_CONFIG[role] || ROLE_CONFIG.student;
            if (regDepartmentLabel) {
                regDepartmentLabel.textContent = config.departmentLabel;
            }
            if (regCampusIdInput) {
                regCampusIdInput.setAttribute("placeholder", "example: " + config.idPlaceholder);
            }
            const previousValue = normalizeText(regDepartmentSelect.value);
            regDepartmentSelect.innerHTML = "";
            const defaultOpt = document.createElement("option");
            defaultOpt.value = "";
            defaultOpt.textContent = "select " + config.departmentLabel;
            regDepartmentSelect.appendChild(defaultOpt);

            config.departments.forEach(function (dept) {
                const opt = document.createElement("option");
                opt.value = dept;
                opt.textContent = dept;
                if (dept === previousValue) {
                    opt.selected = true;
                }
                regDepartmentSelect.appendChild(opt);
            });
        }

        function syncRoleSelections(newRole) {
            const cleanRole = ROLE_CONFIG[newRole] ? newRole : "student";
            document.body.setAttribute("data-role", cleanRole);
            if (roleSelectGlobal && roleSelectGlobal.value !== cleanRole) {
                roleSelectGlobal.value = cleanRole;
            }
            if (loginRoleSelect && loginRoleSelect.value !== cleanRole) {
                loginRoleSelect.value = cleanRole;
            }
            if (regRoleSelect && regRoleSelect.value !== cleanRole) {
                regRoleSelect.value = cleanRole;
            }
            populateDepartments(cleanRole);
            updateAccountCountDisplay(cleanRole);
        }

        function updateAccountCountDisplay(role) {
            if (!accountCountText) {
                return;
            }
            const roleAccs = getRoleAccounts(role);
            const totalAccs = getAccounts().length;
            accountCountText.textContent = "registered " + role + " accounts: " + roleAccs.length + " (total campus accounts: " + totalAccs + ")";
        }

        function setActiveMode(mode, customMessage, statusType) {
            if (!loginFieldset || !registerFieldset) {
                return;
            }
            if (mode === "login") {
                loginFieldset.disabled = false;
                registerFieldset.disabled = true;
                loginFieldset.classList.add("active-panel");
                registerFieldset.classList.remove("active-panel");
                if (modeLoginBtn) {
                    modeLoginBtn.classList.add("active-mode");
                }
                if (modeRegisterBtn) {
                    modeRegisterBtn.classList.remove("active-mode");
                }
                setBannerState(
                    accountStatusBanner,
                    statusType || "success",
                    customMessage || "account already created. login is enabled below."
                );
            } else {
                registerFieldset.disabled = false;
                loginFieldset.disabled = true;
                registerFieldset.classList.add("active-panel");
                loginFieldset.classList.remove("active-panel");
                if (modeRegisterBtn) {
                    modeRegisterBtn.classList.add("active-mode");
                }
                if (modeLoginBtn) {
                    modeLoginBtn.classList.remove("active-mode");
                }
                setBannerState(
                    accountStatusBanner,
                    statusType || "warning",
                    customMessage || "no account created yet. create account is enabled below."
                );
            }
        }

        function evaluateInitialAccountState(role) {
            const roleAccounts = getRoleAccounts(role);
            updateAccountCountDisplay(role);
            if (roleAccounts.length > 0) {
                setActiveMode(
                    "login",
                    "an account is already created for " + role + ". login is enabled.",
                    "success"
                );
            } else {
                setActiveMode(
                    "register",
                    "no " + role + " account found yet. please create an account first.",
                    "warning"
                );
            }
        }

        function validateNameField() {
            if (!regNameInput) {
                return false;
            }
            const raw = normalizeText(regNameInput.value).replace(/\s+/g, " ");
            if (!raw) {
                setRuleItemState(ruleNameItem, false);
                return setFieldState(regNameInput, regNameFeedback, false, "full name is required (first and last name).");
            }
            const words = raw.split(" ");
            const namePattern = /^[a-zà-ÿ]+([ '-][a-zà-ÿ]+)+$/;
            if (raw.length < 4 || words.length < 2 || !namePattern.test(raw)) {
                setRuleItemState(ruleNameItem, false);
                return setFieldState(
                    regNameInput,
                    regNameFeedback,
                    false,
                    "enter a valid full name with at least first and last name using letters only."
                );
            }
            setRuleItemState(ruleNameItem, true);
            return setFieldState(regNameInput, regNameFeedback, true, "full name accuracy verified.");
        }

        function validateCampusIdField() {
            if (!regCampusIdInput) {
                return false;
            }
            const role = getCurrentRole();
            const config = ROLE_CONFIG[role] || ROLE_CONFIG.student;
            const val = normalizeText(regCampusIdInput.value);
            if (!val) {
                setRuleItemState(ruleIdItem, false);
                return setFieldState(
                    regCampusIdInput,
                    regCampusIdFeedback,
                    false,
                    "campus id is required (example: " + config.idPlaceholder + ")."
                );
            }
            const generalPattern = /^[a-z0-9-]{4,15}$/;
            const hasDigits = /[0-9]{2,}/.test(val);
            if (!generalPattern.test(val) || !hasDigits) {
                setRuleItemState(ruleIdItem, false);
                return setFieldState(
                    regCampusIdInput,
                    regCampusIdFeedback,
                    false,
                    "campus id must be 4 to 15 characters and include at least two digits (example: " + config.idPlaceholder + ")."
                );
            }
            const otherPrefixes = Object.keys(ROLE_CONFIG)
                .filter(function (r) {
                    return r !== role;
                })
                .map(function (r) {
                    return ROLE_CONFIG[r].prefix;
                });

            const hasWrongPrefix = otherPrefixes.some(function (prefix) {
                return val.indexOf(prefix) === 0;
            });
            if (hasWrongPrefix) {
                setRuleItemState(ruleIdItem, false);
                return setFieldState(
                    regCampusIdInput,
                    regCampusIdFeedback,
                    false,
                    "role inconsistency: " + role + " campus id cannot start with another role prefix (use " + config.prefix + ")."
                );
            }

            const existing = findAccountByIdentifier(val);
            if (existing) {
                setRuleItemState(ruleIdItem, false);
                return setFieldState(
                    regCampusIdInput,
                    regCampusIdFeedback,
                    false,
                    "this campus id already has an account. switch to login to sign in."
                );
            }

            setRuleItemState(ruleIdItem, true);
            return setFieldState(
                regCampusIdInput,
                regCampusIdFeedback,
                true,
                "campus id is unique and consistent with " + role + " role."
            );
        }

        function validateDobField() {
            if (!regDobInput) {
                return false;
            }
            const role = getCurrentRole();
            const config = ROLE_CONFIG[role] || ROLE_CONFIG.student;
            const dobVal = regDobInput.value;
            if (!dobVal) {
                setRuleItemState(ruleAgeItem, false);
                return setFieldState(regDobInput, regDobFeedback, false, "date of birth is required.");
            }
            const age = calculateAge(dobVal);
            if (age < config.minAge || age > config.maxAge) {
                setRuleItemState(ruleAgeItem, false);
                return setFieldState(
                    regDobInput,
                    regDobFeedback,
                    false,
                    "age inconsistency: " + role + " age must be between " + config.minAge + " and " + config.maxAge + " years."
                );
            }
            setRuleItemState(ruleAgeItem, true);
            return setFieldState(
                regDobInput,
                regDobFeedback,
                true,
                "age (" + age + " years) is consistent with " + role + " role."
            );
        }

        function validatePhoneField() {
            if (!regPhoneInput) {
                return false;
            }
            const raw = normalizeText(regPhoneInput.value);
            const digitsOnly = raw.replace(/[^0-9]/g, "");
            const validChars = /^\+?[0-9][0-9\s-]{6,16}[0-9]$/.test(raw);
            if (!raw || !validChars || digitsOnly.length < 8 || digitsOnly.length > 15) {
                return setFieldState(
                    regPhoneInput,
                    regPhoneFeedback,
                    false,
                    "enter a valid phone number containing 8 to 15 digits."
                );
            }
            return setFieldState(regPhoneInput, regPhoneFeedback, true, "phone number format verified.");
        }

        function validateDepartmentField() {
            if (!regDepartmentSelect) {
                return false;
            }
            const role = getCurrentRole();
            const config = ROLE_CONFIG[role] || ROLE_CONFIG.student;
            const selected = normalizeText(regDepartmentSelect.value);
            if (!selected || config.departments.indexOf(selected) === -1) {
                return setFieldState(
                    regDepartmentSelect,
                    regDepartmentFeedback,
                    false,
                    "select a valid " + config.departmentLabel + " for " + role + "."
                );
            }
            return setFieldState(
                regDepartmentSelect,
                regDepartmentFeedback,
                true,
                config.departmentLabel + " is consistent with " + role + " role."
            );
        }

        function validateEmailFields() {
            if (!regEmailInput || !regConfirmEmailInput) {
                return false;
            }
            const email = normalizeText(regEmailInput.value);
            const confirmEmail = normalizeText(regConfirmEmailInput.value);
            const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;

            let emailValid = false;
            if (!email) {
                setFieldState(regEmailInput, regEmailFeedback, false, "email address is required.");
            } else if (!emailRegex.test(email)) {
                setFieldState(regEmailInput, regEmailFeedback, false, "enter a valid email address (example: user@school.edu).");
            } else if (findAccountByIdentifier(email)) {
                setFieldState(regEmailInput, regEmailFeedback, false, "an account with this email is already created. enable login to sign in.");
            } else {
                emailValid = true;
                setFieldState(regEmailInput, regEmailFeedback, true, "email address format and availability verified.");
            }

            let confirmValid = false;
            if (!confirmEmail) {
                setFieldState(regConfirmEmailInput, regConfirmEmailFeedback, false, "please confirm your email address.");
            } else if (email !== confirmEmail) {
                setFieldState(regConfirmEmailInput, regConfirmEmailFeedback, false, "email inconsistency: confirmation email does not match.");
            } else if (!emailValid) {
                setFieldState(regConfirmEmailInput, regConfirmEmailFeedback, false, "correct the primary email address first.");
            } else {
                confirmValid = true;
                setFieldState(regConfirmEmailInput, regConfirmEmailFeedback, true, "email confirmation matches accurately.");
            }

            const bothOk = emailValid && confirmValid;
            setRuleItemState(ruleEmailItem, bothOk);
            return bothOk;
        }

        function validatePasswordFields() {
            if (!regPasswordInput || !regConfirmPasswordInput) {
                return false;
            }
            const password = String(regPasswordInput.value || "");
            const confirmPassword = String(regConfirmPasswordInput.value || "");
            const campusId = normalizeText(regCampusIdInput ? regCampusIdInput.value : "");
            const emailLocal = normalizeText(regEmailInput ? regEmailInput.value : "").split("@")[0];

            let passValid = false;
            if (!password) {
                setFieldState(regPasswordInput, regPasswordFeedback, false, "password is required.");
            } else if (password.length < 8) {
                setFieldState(regPasswordInput, regPasswordFeedback, false, "password must be at least 8 characters long.");
            } else if (/\s/.test(password)) {
                setFieldState(regPasswordInput, regPasswordFeedback, false, "password must not contain spaces.");
            } else if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
                setFieldState(regPasswordInput, regPasswordFeedback, false, "password must contain both letters and numbers.");
            } else if (campusId && campusId.length >= 3 && normalizeText(password).indexOf(campusId) !== -1) {
                setFieldState(regPasswordInput, regPasswordFeedback, false, "password must not contain your campus id.");
            } else if (emailLocal && emailLocal.length >= 3 && normalizeText(password).indexOf(emailLocal) !== -1) {
                setFieldState(regPasswordInput, regPasswordFeedback, false, "password must not contain your email username.");
            } else {
                passValid = true;
                setFieldState(regPasswordInput, regPasswordFeedback, true, "password strength and accuracy verified.");
            }

            let confirmValid = false;
            if (!confirmPassword) {
                setFieldState(regConfirmPasswordInput, regConfirmPasswordFeedback, false, "please confirm your password.");
            } else if (password !== confirmPassword) {
                setFieldState(regConfirmPasswordInput, regConfirmPasswordFeedback, false, "password inconsistency: passwords do not match.");
            } else if (!passValid) {
                setFieldState(regConfirmPasswordInput, regConfirmPasswordFeedback, false, "resolve primary password requirements first.");
            } else {
                confirmValid = true;
                setFieldState(regConfirmPasswordInput, regConfirmPasswordFeedback, true, "password confirmation matches accurately.");
            }

            const bothOk = passValid && confirmValid;
            setRuleItemState(rulePasswordItem, bothOk);
            return bothOk;
        }

        function renderActiveSession() {
            if (!sessionSection) {
                return;
            }
            const currentSession = getSession();
            if (!currentSession) {
                sessionSection.classList.add("hidden-section");
                return;
            }
            sessionSection.classList.remove("hidden-section");
            if (sessionSummary) {
                sessionSummary.textContent = "authenticated as " + currentSession.role + ": " + currentSession.fullName;
            }
            if (sessionDetailsList) {
                sessionDetailsList.innerHTML = "";
                const items = [
                    "role: " + currentSession.role,
                    "full name: " + currentSession.fullName,
                    "campus id: " + currentSession.campusId,
                    "email: " + currentSession.email,
                    "assignment: " + currentSession.department,
                    "status: active campus identification session"
                ];
                items.forEach(function (text) {
                    const li = document.createElement("li");
                    li.className = "rule-ok";
                    li.textContent = normalizeText(text);
                    sessionDetailsList.appendChild(li);
                });
            }
        }

        function handleAccountLookup() {
            const query = normalizeText(accountCheckInput ? accountCheckInput.value : "");
            const activeRole = getCurrentRole();
            if (!query) {
                evaluateInitialAccountState(activeRole);
                return;
            }
            const existing = findAccountByIdentifier(query);
            if (existing) {
                syncRoleSelections(existing.role);
                setActiveMode(
                    "login",
                    "account found for " + existing.email + " (" + existing.role + "). login is enabled.",
                    "success"
                );
                if (loginIdentifierInput) {
                    loginIdentifierInput.value = query;
                    setFieldState(
                        loginIdentifierInput,
                        loginIdentifierFeedback,
                        true,
                        "registered " + existing.role + " account recognized."
                    );
                }
            } else {
                setActiveMode(
                    "register",
                    "no account found for \"" + query + "\". create account is enabled below.",
                    "warning"
                );
                if (query.indexOf("@") !== -1 && regEmailInput) {
                    regEmailInput.value = query;
                    validateEmailFields();
                } else if (regCampusIdInput) {
                    regCampusIdInput.value = query;
                    validateCampusIdField();
                }
            }
        }

        if (roleSelectGlobal) {
            roleSelectGlobal.addEventListener("change", function () {
                const selectedRole = normalizeText(roleSelectGlobal.value);
                syncRoleSelections(selectedRole);
                evaluateInitialAccountState(selectedRole);
            });
        }

        if (loginRoleSelect) {
            loginRoleSelect.addEventListener("change", function () {
                const selectedRole = normalizeText(loginRoleSelect.value);
                syncRoleSelections(selectedRole);
            });
        }

        if (regRoleSelect) {
            regRoleSelect.addEventListener("change", function () {
                const selectedRole = normalizeText(regRoleSelect.value);
                syncRoleSelections(selectedRole);
                if (regCampusIdInput && regCampusIdInput.value) {
                    validateCampusIdField();
                }
                if (regDobInput && regDobInput.value) {
                    validateDobField();
                }
                if (regDepartmentSelect && regDepartmentSelect.value) {
                    validateDepartmentField();
                }
            });
        }

        if (accountCheckBtn) {
            accountCheckBtn.addEventListener("click", handleAccountLookup);
        }

        if (accountCheckInput) {
            accountCheckInput.addEventListener("input", function () {
                const val = normalizeText(accountCheckInput.value);
                if (val.length >= 4) {
                    const found = findAccountByIdentifier(val);
                    if (found) {
                        syncRoleSelections(found.role);
                        setActiveMode(
                            "login",
                            "account already created for " + val + ". login is enabled.",
                            "success"
                        );
                        if (loginIdentifierInput) {
                            loginIdentifierInput.value = val;
                        }
                    }
                }
            });
        }

        if (modeLoginBtn) {
            modeLoginBtn.addEventListener("click", function () {
                setActiveMode("login", "login mode enabled. enter your credentials below.", "success");
            });
        }

        if (modeRegisterBtn) {
            modeRegisterBtn.addEventListener("click", function () {
                setActiveMode("register", "account creation mode enabled. complete all fields accurately.", "warning");
            });
        }

        if (regNameInput) {
            regNameInput.addEventListener("input", validateNameField);
            regNameInput.addEventListener("blur", validateNameField);
        }
        if (regCampusIdInput) {
            regCampusIdInput.addEventListener("input", function () {
                const val = normalizeText(regCampusIdInput.value);
                const existing = findAccountByIdentifier(val);
                if (existing) {
                    setFieldState(
                        regCampusIdInput,
                        regCampusIdFeedback,
                        false,
                        "account already created with this campus id. enabling login."
                    );
                    if (loginIdentifierInput) {
                        loginIdentifierInput.value = val;
                    }
                    syncRoleSelections(existing.role);
                    setActiveMode(
                        "login",
                        "campus id " + val + " already has an account. login is now enabled.",
                        "success"
                    );
                    return;
                }
                validateCampusIdField();
            });
            regCampusIdInput.addEventListener("blur", validateCampusIdField);
        }
        if (regDobInput) {
            regDobInput.addEventListener("change", validateDobField);
            regDobInput.addEventListener("blur", validateDobField);
        }
        if (regPhoneInput) {
            regPhoneInput.addEventListener("input", validatePhoneField);
            regPhoneInput.addEventListener("blur", validatePhoneField);
        }
        if (regDepartmentSelect) {
            regDepartmentSelect.addEventListener("change", validateDepartmentField);
        }
        if (regEmailInput) {
            regEmailInput.addEventListener("input", function () {
                const val = normalizeText(regEmailInput.value);
                const existing = findAccountByIdentifier(val);
                if (existing) {
                    setFieldState(
                        regEmailInput,
                        regEmailFeedback,
                        false,
                        "account already created with this email. enabling login."
                    );
                    if (loginIdentifierInput) {
                        loginIdentifierInput.value = val;
                    }
                    syncRoleSelections(existing.role);
                    setActiveMode(
                        "login",
                        "email " + val + " already has an account. login is now enabled.",
                        "success"
                    );
                    return;
                }
                validateEmailFields();
            });
            regEmailInput.addEventListener("blur", validateEmailFields);
        }
        if (regConfirmEmailInput) {
            regConfirmEmailInput.addEventListener("input", validateEmailFields);
            regConfirmEmailInput.addEventListener("blur", validateEmailFields);
        }
        if (regPasswordInput) {
            regPasswordInput.addEventListener("input", validatePasswordFields);
            regPasswordInput.addEventListener("blur", validatePasswordFields);
        }
        if (regConfirmPasswordInput) {
            regConfirmPasswordInput.addEventListener("input", validatePasswordFields);
            regConfirmPasswordInput.addEventListener("blur", validatePasswordFields);
        }

        if (registerForm) {
            registerForm.addEventListener("submit", function (event) {
                event.preventDefault();
                const isNameOk = validateNameField();
                const isIdOk = validateCampusIdField();
                const isDobOk = validateDobField();
                const isPhoneOk = validatePhoneField();
                const isDeptOk = validateDepartmentField();
                const isEmailOk = validateEmailFields();
                const isPassOk = validatePasswordFields();

                if (!isNameOk || !isIdOk || !isDobOk || !isPhoneOk || !isDeptOk || !isEmailOk || !isPassOk) {
                    setBannerState(
                        registerBanner,
                        "error",
                        "account creation failed: please fix the highlighted data accuracy and consistency errors."
                    );
                    return;
                }

                const role = getCurrentRole();
                const newAccount = {
                    role: role,
                    fullName: normalizeText(regNameInput.value).replace(/\s+/g, " "),
                    campusId: normalizeText(regCampusIdInput.value),
                    birthDate: regDobInput.value,
                    phone: normalizeText(regPhoneInput.value),
                    department: normalizeText(regDepartmentSelect.value),
                    email: normalizeText(regEmailInput.value),
                    password: String(regPasswordInput.value)
                };

                const accounts = getAccounts();
                accounts.push(newAccount);
                saveAccounts(accounts);
                updateAccountCountDisplay(role);

                setBannerState(
                    registerBanner,
                    "success",
                    "account created for " + newAccount.fullName + " (" + newAccount.campusId + "). login is now enabled."
                );

                registerForm.reset();
                syncRoleSelections(role);

                setActiveMode(
                    "login",
                    "account created for " + newAccount.email + ". login is now enabled below.",
                    "success"
                );

                if (loginIdentifierInput) {
                    loginIdentifierInput.value = newAccount.email;
                    setFieldState(
                        loginIdentifierInput,
                        loginIdentifierFeedback,
                        true,
                        "new " + role + " account ready for login."
                    );
                }
                if (loginPasswordInput) {
                    loginPasswordInput.value = "";
                    loginPasswordInput.focus();
                }
                setBannerState(
                    loginBanner,
                    "success",
                    "your " + role + " account is created. enter your password to login."
                );
            });
        }

        if (loginForm) {
            loginForm.addEventListener("submit", function (event) {
                event.preventDefault();
                const role = loginRoleSelect ? normalizeText(loginRoleSelect.value) : pageRole;
                const identifier = normalizeText(loginIdentifierInput ? loginIdentifierInput.value : "");
                const password = String(loginPasswordInput ? loginPasswordInput.value : "");

                if (!identifier) {
                    setFieldState(
                        loginIdentifierInput,
                        loginIdentifierFeedback,
                        false,
                        "enter your email address or campus id."
                    );
                    setBannerState(loginBanner, "error", "login error: identifier is required.");
                    return;
                }

                const existing = findAccountByIdentifier(identifier);
                if (!existing) {
                    setFieldState(
                        loginIdentifierInput,
                        loginIdentifierFeedback,
                        false,
                        "no account exists for this identifier."
                    );
                    setBannerState(
                        loginBanner,
                        "warning",
                        "account not found. enabling create account so you can register now."
                    );
                    setActiveMode(
                        "register",
                        "no account found for \"" + identifier + "\". please create an account below.",
                        "warning"
                    );
                    if (identifier.indexOf("@") !== -1 && regEmailInput) {
                        regEmailInput.value = identifier;
                    } else if (regCampusIdInput) {
                        regCampusIdInput.value = identifier;
                    }
                    return;
                }

                if (existing.role !== role) {
                    setFieldState(
                        loginIdentifierInput,
                        loginIdentifierFeedback,
                        false,
                        "this account is registered as " + existing.role + ", not " + role + "."
                    );
                    setBannerState(
                        loginBanner,
                        "error",
                        "role inconsistency: please login as " + existing.role + "."
                    );
                    return;
                }

                setFieldState(
                    loginIdentifierInput,
                    loginIdentifierFeedback,
                    true,
                    "account verified for " + existing.role + "."
                );

                if (!password || existing.password !== password) {
                    setFieldState(
                        loginPasswordInput,
                        loginPasswordFeedback,
                        false,
                        "incorrect password for this campus account."
                    );
                    setBannerState(loginBanner, "error", "login failed: invalid password.");
                    return;
                }

                setFieldState(loginPasswordInput, loginPasswordFeedback, true, "password verified.");
                setBannerState(
                    loginBanner,
                    "success",
                    "welcome " + existing.fullName + ". you are logged in as " + existing.role + "."
                );

                saveSession({
                    role: existing.role,
                    fullName: existing.fullName,
                    campusId: existing.campusId,
                    email: existing.email,
                    department: existing.department
                });
                renderActiveSession();
            });
        }

        if (logoutBtn) {
            logoutBtn.addEventListener("click", function () {
                saveSession(null);
                renderActiveSession();
                setBannerState(
                    accountStatusBanner,
                    "success",
                    "you have logged out. login remains enabled for existing accounts."
                );
            });
        }

        syncRoleSelections(pageRole);
        evaluateInitialAccountState(pageRole);
        renderActiveSession();
    });
})();
