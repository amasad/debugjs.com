SRC = $(wildcard lib/*/*.js)
CSS = $(wildcard lib/*/*.css)
HTML = $(wildcard lib/*/*.html)
COMPONENTJSON = $(wildcard lib/*/component.json)
TEMPLATES = $(HTML:.html=.js)

build: components $(SRC) $(CSS) $(TEMPLATES)
	@echo building
	@component build --dev

components: component.json $(COMPONENTJSON)
	@echo installing
	@component install

%.js: %.html
	@echo converting
	@component convert $<

clean:
	@echo cleaning
	rm -fr build components $(TEMPLATES)

.PHONY: clean
