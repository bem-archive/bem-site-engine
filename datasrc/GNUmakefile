BIN := ./node_modules/.bin
NPM_DEPS := $(addprefix node_modules/,\
	$(shell node -pe "Object.keys(require('./package.json').dependencies).join(' ')"))

all:: build

build:: deps sources

deps:: $(NPM_DEPS)

$(NPM_DEPS):: node_modules

node_modules::
	@npm install

sources:: cache

sources cache::
	$(INFO ===> Building "$@")
	$(BIN)/bem make $@

clean::
	@$(RM) -r ./_*

.PHONY: build deps sources cache clean
