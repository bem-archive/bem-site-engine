NPM_BIN = node_modules/.bin
ENB = $(NPM_BIN)/enb
BOWER = $(NPM_BIN)/bower
JSHINT = $(NPM_BIN)/jshint

ifneq ($(YENV),production)
	YENV=dev
endif

.PHONY: build
build: npm_deps bower_deps config
	$(ENB) make --no-cache

.PHONY: clean
clean: npm_deps
	$(ENB) make clean

.PHONY: config
config:
	cd configs && ln -snf $(YENV) current
	if [ -f configs/current/borschik ]; then ln -sfn configs/current/borschik .borschik; fi;

.PHONY: lint
lint: npm_deps
	$(JSHINT) .

.PHONY: bower_deps
bower_deps: npm_deps
	$(BOWER) install

.PHONY: npm_deps
npm_deps:
	npm install
