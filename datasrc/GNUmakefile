NPM ?= npm

NPM_BIN := $(shell $(NPM) bin)

NPM_DEPS := $(shell node -pe "Object.keys(require('./package.json').dependencies).join(' ')")
NPM_DEPS_PATHS := $(addprefix node_modules/,$(NPM_DEPS))

with_npm_registry_flag:=--registry http://npm.yandex-team.ru
do_npm = $(NPM) $(with_npm_registry_flag) $(1) $(2) $(3) $(4) $(5)

all:: build

build:: deps sources

deps:: $(NPM_DEPS_PATHS)

$(NPM_DEPS_PATHS):: node_modules

node_modules::
	$(call do_npm,install)

sources:: cache

cache sources::
	$(info ===> Building "$@")
	$(NPM_BIN)/bem make -w 12 $@

clean::
	$(RM) -r ./.bem/cache*
	$(RM) -r _*
	$(call do_npm,prune)
	$(call do_npm,uninstall,$(NPM_DEPS))

.PHONY: all build deps sources cache clean

