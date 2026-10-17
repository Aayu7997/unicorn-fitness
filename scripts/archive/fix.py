import re

with open('app/dashboard/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

pattern = re.compile(r'\{/\* Navigation Menu \*/\}.*?\{/\* Main Content Column', re.DOTALL)
replacement = """{/* Navigation Menu */}
            <div className="flex flex-col gap-2 flex-1">
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-2 px-2">Dashboard</p>
              {navItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`relative flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group ${
                    activeTab === item.id 
                      ? 'bg-accent/10 text-accent font-bold' 
                      : 'text-gray-400 hover:bg-white/5 hover:text-gray-200 font-semibold'
                  }`}
                >
                  <item.icon className={`w-5 h-5 flex-shrink-0 ${activeTab === item.id ? 'text-accent' : 'opacity-70 group-hover:opacity-100'}`} />
                  <span className="whitespace-nowrap flex-1 text-left tracking-wide text-sm">{item.label}</span>
                  {activeTab === item.id && <ChevronRight className="w-4 h-4 opacity-50" />}
                </button>
              ))}
            </div>
            
            <div className="mt-auto pt-6 border-t border-white/5">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-4 px-4 py-3.5 text-red-400/80 hover:text-red-400 hover:bg-red-500/10 rounded-2xl transition-all font-semibold"
              >
                <LogOut className="w-5 h-5 flex-shrink-0" />
                <span className="whitespace-nowrap tracking-wide text-sm">Sign Out</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content Column"""

content = pattern.sub(replacement, content)

with open('app/dashboard/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)